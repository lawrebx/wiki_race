import { pgTable, text, timestamp, integer, boolean, uuid, pgEnum, index, jsonb } from 'drizzle-orm/pg-core';

// Enums
export const playerStatusEnum = pgEnum('player_status', ['waiting', 'active', 'finished', 'disconnected']);
export const lobbyStatusEnum = pgEnum('lobby_status', ['waiting', 'in_progress', 'finished']);
export const gameDifficultyEnum = pgEnum('game_difficulty', ['easy', 'medium', 'hard']);

// Lobbies table
export const lobbies = pgTable('lobbies', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  hostId: uuid('host_id').notNull(),
  status: lobbyStatusEnum('status').notNull().default('waiting'),
  startArticle: text('start_article'),
  targetArticle: text('target_article'),
  timeLimit: integer('time_limit'), // in seconds
  maxPlayers: integer('max_players').notNull().default(8),
  difficulty: gameDifficultyEnum('difficulty'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
}, (table) => ({
  codeIdx: index('code_idx').on(table.code),
  statusIdx: index('status_idx').on(table.status),
}));

// Players table
export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  lobbyId: uuid('lobby_id').notNull().references(() => lobbies.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  displayName: text('display_name').notNull(),
  status: playerStatusEnum('status').notNull().default('waiting'),
  currentPage: text('current_page'),
  clickCount: integer('click_count').notNull().default(0),
  finishedAt: timestamp('finished_at'),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  path: jsonb('path').notNull().default([]), // Array of page titles
  rank: integer('rank'),
}, (table) => ({
  lobbyIdx: index('lobby_idx').on(table.lobbyId),
  sessionIdx: index('session_idx').on(table.sessionId),
}));

// Dead pages table - tracks pages that have been visited and left
export const deadPages = pgTable('dead_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  lobbyId: uuid('lobby_id').notNull().references(() => lobbies.id, { onDelete: 'cascade' }),
  pageTitle: text('page_title').notNull(),
  playerId: uuid('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  markedDeadAt: timestamp('marked_dead_at').notNull().defaultNow(),
}, (table) => ({
  lobbyPageIdx: index('lobby_page_idx').on(table.lobbyId, table.pageTitle),
}));

// Moves table - audit trail of all moves
export const moves = pgTable('moves', {
  id: uuid('id').primaryKey().defaultRandom(),
  lobbyId: uuid('lobby_id').notNull().references(() => lobbies.id, { onDelete: 'cascade' }),
  playerId: uuid('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  fromPage: text('from_page'),
  toPage: text('to_page').notNull(),
  success: boolean('success').notNull(),
  failureReason: text('failure_reason'),
  movedAt: timestamp('moved_at').notNull().defaultNow(),
}, (table) => ({
  lobbyIdx: index('moves_lobby_idx').on(table.lobbyId),
  playerIdx: index('moves_player_idx').on(table.playerId),
}));

// Wikipedia articles cache
export const articleCache = pgTable('article_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull().unique(),
  content: text('content').notNull(), // HTML content
  links: jsonb('links').notNull(), // Array of valid internal links
  cachedAt: timestamp('cached_at').notNull().defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
}, (table) => ({
  titleIdx: index('title_idx').on(table.title),
}));

// Article pairs for generating games
export const articlePairs = pgTable('article_pairs', {
  id: uuid('id').primaryKey().defaultRandom(),
  startArticle: text('start_article').notNull(),
  targetArticle: text('target_article').notNull(),
  difficulty: gameDifficultyEnum('difficulty').notNull(),
  estimatedClicks: integer('estimated_clicks').notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  difficultyIdx: index('difficulty_idx').on(table.difficulty),
}));

export type Lobby = typeof lobbies.$inferSelect;
export type NewLobby = typeof lobbies.$inferInsert;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type DeadPage = typeof deadPages.$inferSelect;
export type NewDeadPage = typeof deadPages.$inferInsert;
export type Move = typeof moves.$inferSelect;
export type NewMove = typeof moves.$inferInsert;
export type ArticleCache = typeof articleCache.$inferSelect;
export type NewArticleCache = typeof articleCache.$inferInsert;
export type ArticlePair = typeof articlePairs.$inferSelect;
export type NewArticlePair = typeof articlePairs.$inferInsert;
