import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { gameManager } from '../services/game.service.js';
import { Server } from 'http';

interface WSClient extends WebSocket {
  id: string;
  sessionId?: string;
  lobbyId?: string;
  playerId?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();
  private lobbyClients: Map<string, Set<string>> = new Map(); // lobbyId -> Set of clientIds

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WSClient) => {
      ws.id = uuidv4();
      this.clients.set(ws.id, ws);

      console.log(`Client connected: ${ws.id}`);

      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log(`Client disconnected: ${ws.id}`);
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${ws.id}:`, error);
      });
    });
  }

  private async handleMessage(ws: WSClient, message: any) {
    const { type, payload } = message;

    try {
      switch (type) {
        case 'join_lobby':
          await this.handleJoinLobby(ws, payload);
          break;

        case 'start_game':
          await this.handleStartGame(ws, payload);
          break;

        case 'move':
          await this.handleMove(ws, payload);
          break;

        case 'leave_lobby':
          await this.handleLeaveLobby(ws);
          break;

        default:
          this.sendError(ws, `Unknown message type: ${type}`);
      }
    } catch (error: any) {
      console.error(`Error handling ${type}:`, error);
      this.sendError(ws, error.message || 'An error occurred');
    }
  }

  private async handleJoinLobby(ws: WSClient, payload: any) {
    const { lobbyId, sessionId, playerId } = payload;

    ws.sessionId = sessionId;
    ws.lobbyId = lobbyId;
    ws.playerId = playerId;

    // Add to lobby clients
    if (!this.lobbyClients.has(lobbyId)) {
      this.lobbyClients.set(lobbyId, new Set());
    }
    this.lobbyClients.get(lobbyId)!.add(ws.id);

    // Send current game state
    const gameState = await gameManager.getGameState(lobbyId);
    this.sendToClient(ws, {
      type: 'game_state',
      payload: gameState,
    });

    // Notify others in lobby
    this.broadcastToLobby(lobbyId, {
      type: 'player_joined',
      payload: { playerId },
    }, ws.id);
  }

  private async handleStartGame(ws: WSClient, payload: any) {
    if (!ws.lobbyId || !ws.sessionId) {
      this.sendError(ws, 'Not in a lobby');
      return;
    }

    const gameState = await gameManager.startGame(ws.lobbyId, ws.sessionId);

    // Notify all players in lobby
    this.broadcastToLobby(ws.lobbyId, {
      type: 'game_started',
      payload: gameState,
    });
  }

  private async handleMove(ws: WSClient, payload: any) {
    if (!ws.lobbyId || !ws.playerId) {
      this.sendError(ws, 'Not in a game');
      return;
    }

    const { targetPage } = payload;
    const result = await gameManager.makeMove(ws.lobbyId, ws.playerId, targetPage);

    if (result.success) {
      // Send updated game state to all players
      this.broadcastToLobby(ws.lobbyId, {
        type: 'game_state',
        payload: result.gameState,
      });

      // Check if player finished
      const player = result.gameState!.players.find(p => p.id === ws.playerId);
      if (player && player.status === 'finished') {
        this.broadcastToLobby(ws.lobbyId, {
          type: 'player_finished',
          payload: { playerId: ws.playerId, rank: player.rank },
        });
      }

      // Check if game ended
      if (result.gameState!.lobby.status === 'finished') {
        this.broadcastToLobby(ws.lobbyId, {
          type: 'game_ended',
          payload: result.gameState,
        });
      }
    } else {
      this.sendToClient(ws, {
        type: 'move_failed',
        payload: { message: result.message },
      });
    }
  }

  private async handleLeaveLobby(ws: WSClient) {
    if (!ws.lobbyId) return;

    const lobbyId = ws.lobbyId;
    const playerId = ws.playerId;

    // Remove from lobby clients
    this.lobbyClients.get(lobbyId)?.delete(ws.id);

    // Notify others
    this.broadcastToLobby(lobbyId, {
      type: 'player_left',
      payload: { playerId },
    }, ws.id);

    ws.lobbyId = undefined;
    ws.playerId = undefined;
  }

  private handleDisconnect(ws: WSClient) {
    if (ws.lobbyId) {
      this.handleLeaveLobby(ws);
    }
    this.clients.delete(ws.id);
  }

  private sendToClient(client: WSClient, message: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private sendError(client: WSClient, message: string) {
    this.sendToClient(client, {
      type: 'error',
      payload: { message },
    });
  }

  private broadcastToLobby(lobbyId: string, message: any, excludeClientId?: string) {
    const lobbyClientIds = this.lobbyClients.get(lobbyId);
    if (!lobbyClientIds) return;

    for (const clientId of lobbyClientIds) {
      if (clientId === excludeClientId) continue;

      const client = this.clients.get(clientId);
      if (client) {
        this.sendToClient(client, message);
      }
    }
  }
}
