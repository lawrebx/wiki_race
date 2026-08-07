const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export enum WSMessageType {
  JOIN_LOBBY = 'join_lobby',
  START_GAME = 'start_game',
  MOVE = 'move',
  LEAVE_LOBBY = 'leave_lobby',
  LOBBY_STATE = 'lobby_state',
  GAME_STATE = 'game_state',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_STARTED = 'game_started',
  MOVE_SUCCESS = 'move_success',
  MOVE_FAILED = 'move_failed',
  PLAYER_FINISHED = 'player_finished',
  GAME_ENDED = 'game_ended',
  ERROR = 'error',
}

export interface WSMessage {
  type: WSMessageType;
  payload: any;
}

type MessageHandler = (payload: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<WSMessageType, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${WS_URL}/ws`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: WSMessageType, payload: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  on(type: WSMessageType, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  off(type: WSMessageType, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  private handleMessage(message: WSMessage) {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.payload));
    }
  }

  joinLobby(lobbyId: string, sessionId: string, playerId: string) {
    this.send(WSMessageType.JOIN_LOBBY, { lobbyId, sessionId, playerId });
  }

  startGame() {
    this.send(WSMessageType.START_GAME);
  }

  makeMove(targetPage: string) {
    this.send(WSMessageType.MOVE, { targetPage });
  }

  leaveLobby() {
    this.send(WSMessageType.LEAVE_LOBBY);
  }
}
