import { db, lobbies, players, deadPages, moves } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { wikipediaService } from './wikipedia.service.js';
import { v4 as uuidv4 } from 'uuid';

export interface GameState {
  lobby: any;
  players: any[];
  deadPages: string[];
  occupiedPages: { [page: string]: string };
}

export class GameManager {
  
  /**
   * Create a new lobby
   */
  async createLobby(
    hostSessionId: string,
    displayName: string,
    options: {
      startArticle?: string;
      targetArticle?: string;
      timeLimit?: number;
      maxPlayers?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    }
  ) {
    // Generate unique lobby code
    const code = this.generateLobbyCode();

    // If no articles specified, generate a pair based on difficulty
    let startArticle = options.startArticle;
    let targetArticle = options.targetArticle;

    if (!startArticle || !targetArticle) {
      const difficulty = options.difficulty || 'medium';
      const pair = await wikipediaService.getArticlePair(difficulty);
      if (pair) {
        startArticle = startArticle || pair.start;
        targetArticle = targetArticle || pair.target;
      }
    }

    // Create lobby
    const [lobby] = await db.insert(lobbies).values({
      code,
      hostId: hostSessionId,
      status: 'waiting',
      startArticle: startArticle || null,
      targetArticle: targetArticle || null,
      timeLimit: options.timeLimit || null,
      maxPlayers: options.maxPlayers || 8,
      difficulty: options.difficulty || null,
    }).returning();

    // Create host player
    const [player] = await db.insert(players).values({
      lobbyId: lobby.id,
      sessionId: hostSessionId,
      displayName,
      status: 'waiting',
      path: [],
    }).returning();

    return { lobby, player };
  }

  /**
   * Join an existing lobby
   */
  async joinLobby(code: string, sessionId: string, displayName: string) {
    // Find lobby
    const [lobby] = await db.select()
      .from(lobbies)
      .where(eq(lobbies.code, code))
      .limit(1);

    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.status !== 'waiting') {
      throw new Error('Game has already started');
    }

    // Check if lobby is full
    const existingPlayers = await db.select()
      .from(players)
      .where(eq(players.lobbyId, lobby.id));

    if (existingPlayers.length >= lobby.maxPlayers) {
      throw new Error('Lobby is full');
    }

    // Check if player already in lobby
    const existingPlayer = existingPlayers.find(p => p.sessionId === sessionId);
    if (existingPlayer) {
      return { lobby, player: existingPlayer };
    }

    // Create player
    const [player] = await db.insert(players).values({
      lobbyId: lobby.id,
      sessionId,
      displayName,
      status: 'waiting',
      path: [],
    }).returning();

    return { lobby, player };
  }

  /**
   * Start a game
   */
  async startGame(lobbyId: string, hostSessionId: string) {
    // Verify host
    const [lobby] = await db.select()
      .from(lobbies)
      .where(eq(lobbies.id, lobbyId))
      .limit(1);

    if (!lobby) {
      throw new Error('Lobby not found');
    }

    if (lobby.hostId !== hostSessionId) {
      throw new Error('Only the host can start the game');
    }

    if (lobby.status !== 'waiting') {
      throw new Error('Game has already started');
    }

    // Start the game
    await db.update(lobbies)
      .set({
        status: 'in_progress',
        startedAt: new Date(),
      })
      .where(eq(lobbies.id, lobbyId));

    // Set all players to active and place them on the start article
    await db.update(players)
      .set({
        status: 'active',
        currentPage: lobby.startArticle,
        path: [lobby.startArticle],
      })
      .where(eq(players.lobbyId, lobbyId));

    return this.getGameState(lobbyId);
  }

  /**
   * Make a move
   */
  async makeMove(
    lobbyId: string,
    playerId: string,
    targetPage: string
  ): Promise<{ success: boolean; message?: string; gameState?: GameState }> {
    // Get player
    const [player] = await db.select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (!player) {
      return { success: false, message: 'Player not found' };
    }

    if (player.status !== 'active') {
      return { success: false, message: 'You are not active in this game' };
    }

    if (!player.currentPage) {
      return { success: false, message: 'Invalid state: no current page' };
    }

    const normalizedTarget = wikipediaService.normalizeTitle(targetPage);

    // Check if target page is dead
    const isDead = await this.isPageDead(lobbyId, normalizedTarget);
    if (isDead) {
      await this.logMove(lobbyId, playerId, player.currentPage, normalizedTarget, false, 'Page is dead');
      return { success: false, message: 'That page is dead.' };
    }

    // Check if target page is occupied by another player
    const occupier = await this.getPageOccupier(lobbyId, normalizedTarget);
    if (occupier && occupier !== playerId) {
      await this.logMove(lobbyId, playerId, player.currentPage, normalizedTarget, false, 'Page is occupied');
      return { success: false, message: 'That page is currently occupied.' };
    }

    // Validate that the move is valid (link exists)
    const isValidLink = await wikipediaService.validateMove(player.currentPage, normalizedTarget);
    if (!isValidLink) {
      await this.logMove(lobbyId, playerId, player.currentPage, normalizedTarget, false, 'Invalid link');
      return { success: false, message: 'Invalid move: link not found on current page.' };
    }

    // Get lobby to check target
    const [lobby] = await db.select()
      .from(lobbies)
      .where(eq(lobbies.id, lobbyId))
      .limit(1);

    // Mark current page as dead (unless it's the start article)
    if (player.currentPage !== lobby.startArticle) {
      await db.insert(deadPages).values({
        lobbyId,
        pageTitle: player.currentPage,
        playerId,
      });
    }

    // Update player position
    const newPath = [...(player.path as string[]), normalizedTarget];
    await db.update(players)
      .set({
        currentPage: normalizedTarget,
        clickCount: player.clickCount + 1,
        path: newPath,
      })
      .where(eq(players.id, playerId));

    // Log successful move
    await this.logMove(lobbyId, playerId, player.currentPage, normalizedTarget, true);

    // Check if player reached the target
    if (normalizedTarget === lobby.targetArticle) {
      await this.finishPlayer(playerId);
      
      // Check if game should end
      await this.checkGameEnd(lobbyId);
    }

    const gameState = await this.getGameState(lobbyId);
    return { success: true, gameState };
  }

  /**
   * Finish a player (they reached the target)
   */
  private async finishPlayer(playerId: string) {
    const [player] = await db.select()
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    if (!player) return;

    // Calculate rank
    const finishedPlayers = await db.select()
      .from(players)
      .where(and(
        eq(players.lobbyId, player.lobbyId),
        eq(players.status, 'finished')
      ));

    const rank = finishedPlayers.length + 1;

    await db.update(players)
      .set({
        status: 'finished',
        finishedAt: new Date(),
        rank,
      })
      .where(eq(players.id, playerId));
  }

  /**
   * Check if game should end
   */
  private async checkGameEnd(lobbyId: string) {
    const allPlayers = await db.select()
      .from(players)
      .where(eq(players.lobbyId, lobbyId));

    const activePlayers = allPlayers.filter(p => p.status === 'active');

    // If no active players, end the game
    if (activePlayers.length === 0) {
      await db.update(lobbies)
        .set({
          status: 'finished',
          endedAt: new Date(),
        })
        .where(eq(lobbies.id, lobbyId));
    }
  }

  /**
   * Check if a page is dead
   */
  private async isPageDead(lobbyId: string, pageTitle: string): Promise<boolean> {
    const result = await db.select()
      .from(deadPages)
      .where(and(
        eq(deadPages.lobbyId, lobbyId),
        eq(deadPages.pageTitle, pageTitle)
      ))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Get the player currently occupying a page
   */
  private async getPageOccupier(lobbyId: string, pageTitle: string): Promise<string | null> {
    const result = await db.select()
      .from(players)
      .where(and(
        eq(players.lobbyId, lobbyId),
        eq(players.currentPage, pageTitle),
        eq(players.status, 'active')
      ))
      .limit(1);

    return result[0]?.id || null;
  }

  /**
   * Log a move
   */
  private async logMove(
    lobbyId: string,
    playerId: string,
    fromPage: string,
    toPage: string,
    success: boolean,
    failureReason?: string
  ) {
    await db.insert(moves).values({
      lobbyId,
      playerId,
      fromPage,
      toPage,
      success,
      failureReason: failureReason || null,
    });
  }

  /**
   * Get current game state
   */
  async getGameState(lobbyId: string): Promise<GameState> {
    const [lobby] = await db.select()
      .from(lobbies)
      .where(eq(lobbies.id, lobbyId))
      .limit(1);

    const allPlayers = await db.select()
      .from(players)
      .where(eq(players.lobbyId, lobbyId));

    const allDeadPages = await db.select()
      .from(deadPages)
      .where(eq(deadPages.lobbyId, lobbyId));

    const occupiedPages: { [page: string]: string } = {};
    for (const player of allPlayers) {
      if (player.currentPage && player.status === 'active') {
        occupiedPages[player.currentPage] = player.id;
      }
    }

    return {
      lobby,
      players: allPlayers,
      deadPages: allDeadPages.map(dp => dp.pageTitle),
      occupiedPages,
    };
  }

  /**
   * Get lobby by code
   */
  async getLobbyByCode(code: string) {
    const [lobby] = await db.select()
      .from(lobbies)
      .where(eq(lobbies.code, code))
      .limit(1);

    return lobby || null;
  }

  /**
   * Generate a unique lobby code
   */
  private generateLobbyCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}

export const gameManager = new GameManager();
