const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateLobbyRequest {
  displayName: string;
  startArticle?: string;
  targetArticle?: string;
  timeLimit?: number;
  maxPlayers?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface JoinLobbyRequest {
  displayName: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_URL}/api`;
  }

  async createLobby(data: CreateLobbyRequest) {
    const response = await fetch(`${this.baseUrl}/lobbies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create lobby');
    }

    return response.json();
  }

  async joinLobby(code: string, data: JoinLobbyRequest) {
    const response = await fetch(`${this.baseUrl}/lobbies/${code}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join lobby');
    }

    return response.json();
  }

  async getLobby(code: string) {
    const response = await fetch(`${this.baseUrl}/lobbies/${code}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get lobby');
    }

    return response.json();
  }

  async getArticle(title: string) {
    const response = await fetch(`${this.baseUrl}/articles/${encodeURIComponent(title)}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get article');
    }

    return response.json();
  }

  async getGameState(lobbyId: string) {
    const response = await fetch(`${this.baseUrl}/lobbies/${lobbyId}/state`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get game state');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
