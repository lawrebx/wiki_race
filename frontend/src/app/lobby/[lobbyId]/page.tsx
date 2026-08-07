'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { WebSocketClient, WSMessageType } from '@/lib/websocket';
import { apiClient } from '@/lib/api';
import WaitingRoom from '@/components/WaitingRoom';
import GameView from '@/components/GameView';

export default function LobbyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const lobbyId = params.lobbyId as string;
  const playerId = searchParams.get('player');
  
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    if (!playerId) {
      router.push('/');
      return;
    }

    initializeConnection();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [lobbyId, playerId]);

  const initializeConnection = async () => {
    try {
      // Get initial game state
      const response = await apiClient.getGameState(lobbyId);
      setGameState(response.gameState);

      // Connect WebSocket
      const ws = new WebSocketClient();
      await ws.connect();
      wsRef.current = ws;

      // Get session ID from cookie
      const sessionId = getSessionId();

      // Join lobby via WebSocket
      ws.joinLobby(lobbyId, sessionId, playerId!);

      // Set up WebSocket event handlers
      ws.on(WSMessageType.GAME_STATE, (payload) => {
        setGameState(payload);
      });

      ws.on(WSMessageType.GAME_STARTED, (payload) => {
        setGameState(payload);
      });

      ws.on(WSMessageType.PLAYER_JOINED, async () => {
        // Refresh game state
        const response = await apiClient.getGameState(lobbyId);
        setGameState(response.gameState);
      });

      ws.on(WSMessageType.PLAYER_LEFT, async () => {
        const response = await apiClient.getGameState(lobbyId);
        setGameState(response.gameState);
      });

      ws.on(WSMessageType.PLAYER_FINISHED, async () => {
        const response = await apiClient.getGameState(lobbyId);
        setGameState(response.gameState);
      });

      ws.on(WSMessageType.GAME_ENDED, (payload) => {
        setGameState(payload);
      });

      ws.on(WSMessageType.ERROR, (payload) => {
        setError(payload.message);
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect');
      setLoading(false);
    }
  };

  const getSessionId = (): string => {
    // Extract session ID from cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'sessionId') {
        return value;
      }
    }
    return '';
  };

  const handleStartGame = () => {
    if (wsRef.current) {
      wsRef.current.startGame();
    }
  };

  const handleMove = (targetPage: string) => {
    if (wsRef.current) {
      wsRef.current.makeMove(targetPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary w-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return null;
  }

  const isWaiting = gameState.lobby.status === 'waiting';
  const currentPlayer = gameState.players.find((p: any) => p.id === playerId);
  const isHost = gameState.lobby.hostId === currentPlayer?.sessionId;

  return (
    <>
      {isWaiting ? (
        <WaitingRoom
          gameState={gameState}
          isHost={isHost}
          onStartGame={handleStartGame}
        />
      ) : (
        <GameView
          gameState={gameState}
          currentPlayer={currentPlayer}
          onMove={handleMove}
        />
      )}
    </>
  );
}
