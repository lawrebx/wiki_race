// Shared types for Wiki Race application

export enum PlayerStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  FINISHED = 'finished',
  DISCONNECTED = 'disconnected'
}

export enum LobbyStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

export enum GameDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface Player {
  id: string;
  sessionId: string;
  displayName: string;
  status: PlayerStatus;
  currentPage: string | null;
  clickCount: number;
  finishedAt: Date | null;
  joinedAt: Date;
  path: string[];
  rank: number | null;
}

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  status: LobbyStatus;
  startArticle: string | null;
  targetArticle: string | null;
  timeLimit: number | null; // in seconds
  maxPlayers: number;
  difficulty: GameDifficulty | null;
  createdAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
}

export interface GameState {
  lobby: Lobby;
  players: Player[];
  deadPages: string[];
  occupiedPages: { [page: string]: string }; // page -> playerId
}

// WebSocket message types
export enum WSMessageType {
  // Client -> Server
  JOIN_LOBBY = 'join_lobby',
  START_GAME = 'start_game',
  MOVE = 'move',
  LEAVE_LOBBY = 'leave_lobby',
  
  // Server -> Client
  LOBBY_STATE = 'lobby_state',
  GAME_STATE = 'game_state',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_STARTED = 'game_started',
  MOVE_SUCCESS = 'move_success',
  MOVE_FAILED = 'move_failed',
  PLAYER_FINISHED = 'player_finished',
  GAME_ENDED = 'game_ended',
  ERROR = 'error'
}

export interface WSMessage {
  type: WSMessageType;
  payload: any;
}

// API request/response types
export interface CreateLobbyRequest {
  displayName: string;
  startArticle?: string;
  targetArticle?: string;
  timeLimit?: number;
  maxPlayers?: number;
  difficulty?: GameDifficulty;
}

export interface CreateLobbyResponse {
  lobby: Lobby;
  player: Player;
  inviteUrl: string;
}

export interface JoinLobbyRequest {
  code: string;
  displayName: string;
}

export interface JoinLobbyResponse {
  lobby: Lobby;
  player: Player;
  gameState: GameState;
}

export interface MoveRequest {
  targetPage: string;
}

export interface MoveResponse {
  success: boolean;
  message?: string;
  currentPage?: string;
  deadPages?: string[];
}

export interface WikipediaArticle {
  title: string;
  content: string; // HTML content
  links: string[]; // Valid internal links
}

export interface ArticlePair {
  start: string;
  target: string;
  estimatedClicks: number;
}
