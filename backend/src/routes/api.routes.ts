import { Router } from 'express';
import { gameManager } from '../services/game.service.js';
import { wikipediaService } from '../services/wikipedia.service.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * Create a new lobby
 * POST /api/lobbies
 */
router.post('/lobbies', async (req, res) => {
  try {
    const {
      displayName,
      startArticle,
      targetArticle,
      timeLimit,
      maxPlayers,
      difficulty,
    } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Get or create session ID
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    const { lobby, player } = await gameManager.createLobby(
      sessionId,
      displayName,
      {
        startArticle,
        targetArticle,
        timeLimit,
        maxPlayers,
        difficulty,
      }
    );

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${lobby.code}`;

    res.json({
      lobby,
      player,
      inviteUrl,
    });
  } catch (error: any) {
    console.error('Error creating lobby:', error);
    res.status(500).json({ error: error.message || 'Failed to create lobby' });
  }
});

/**
 * Join a lobby
 * POST /api/lobbies/:code/join
 */
router.post('/lobbies/:code/join', async (req, res) => {
  try {
    const { code } = req.params;
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Get or create session ID
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    const { lobby, player } = await gameManager.joinLobby(
      code.toUpperCase(),
      sessionId,
      displayName
    );

    const gameState = await gameManager.getGameState(lobby.id);

    res.json({
      lobby,
      player,
      gameState,
    });
  } catch (error: any) {
    console.error('Error joining lobby:', error);
    res.status(400).json({ error: error.message || 'Failed to join lobby' });
  }
});

/**
 * Get lobby info by code
 * GET /api/lobbies/:code
 */
router.get('/lobbies/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const lobby = await gameManager.getLobbyByCode(code.toUpperCase());

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    res.json({ lobby });
  } catch (error: any) {
    console.error('Error getting lobby:', error);
    res.status(500).json({ error: 'Failed to get lobby' });
  }
});

/**
 * Get Wikipedia article
 * GET /api/articles/:title
 */
router.get('/articles/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const article = await wikipediaService.getArticle(title);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

/**
 * Get game state for a lobby
 * GET /api/lobbies/:lobbyId/state
 */
router.get('/lobbies/:lobbyId/state', async (req, res) => {
  try {
    const { lobbyId } = req.params;
    const gameState = await gameManager.getGameState(lobbyId);

    res.json({ gameState });
  } catch (error: any) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
});

/**
 * Health check
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
