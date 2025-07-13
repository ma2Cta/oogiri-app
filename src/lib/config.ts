/**
 * アプリケーション設定と環境変数検証
 */

// 必須環境変数のチェック
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET', 
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
] as const;

// 環境変数検証
function validateEnvironment() {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// 本番環境でのみ検証実行
if (process.env.NODE_ENV === 'production') {
  validateEnvironment();
}

// アプリケーション設定
export const config = {
  // 環境
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // データベース
  databaseUrl: process.env.DATABASE_URL!,
  
  // 認証
  nextAuthUrl: process.env.NEXTAUTH_URL!,
  nextAuthSecret: process.env.NEXTAUTH_SECRET!,
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  
  // WebSocket
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3001'),
  
  // サーバー
  port: parseInt(process.env.PORT || '3000'),
  hostname: process.env.HOSTNAME || 'localhost',
} as const;

// ゲーム定数
export const GAME_CONSTANTS = {
  // 回答制限
  ANSWER_MAX_LENGTH: 200,
  ANSWER_MIN_LENGTH: 1,
  
  // ルーム設定
  ROOM_CODE_LENGTH: 6,
  ROOM_NAME_MAX_LENGTH: 50,
  MAX_PLAYERS_PER_ROOM: 12,
  MIN_PLAYERS_PER_ROOM: 2,
  
  // ゲーム設定
  MAX_ROUNDS: 20,
  MIN_ROUNDS: 1,
  MAX_ANSWER_TIME: 300, // 5分
  MIN_ANSWER_TIME: 30,  // 30秒
  MAX_VOTING_TIME: 120, // 2分
  MIN_VOTING_TIME: 15,  // 15秒
  
  // WebSocket
  HEARTBEAT_INTERVAL: 10000,      // 10秒
  CONNECTION_TIMEOUT: 30000,      // 30秒
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000,          // 1秒
  
  // API制限
  ROOM_CODE_GENERATION_MAX_ATTEMPTS: 10,
  API_RATE_LIMIT_WINDOW: 60000,   // 1分
  API_RATE_LIMIT_MAX_REQUESTS: 100,
  
  // デフォルト値
  DEFAULT_TOTAL_ROUNDS: 5,
  DEFAULT_ANSWER_TIME_LIMIT: 60,
  DEFAULT_VOTING_TIME_LIMIT: 30,
  DEFAULT_MAX_PLAYERS: 6,
} as const;

// ゲームフェーズ定数
export const GAME_PHASES = {
  WAITING: 'waiting',
  QUESTION: 'question', 
  ANSWERING: 'answering',
  VOTING: 'voting',
  RESULTS: 'results',
  FINISHED: 'finished'
} as const;

export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES];

// ルームステータス定数
export const ROOM_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing', 
  FINISHED: 'finished'
} as const;

export type RoomStatus = typeof ROOM_STATUS[keyof typeof ROOM_STATUS];

// プレイヤーステータス定数
export const PLAYER_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected'
} as const;

export type PlayerStatus = typeof PLAYER_STATUS[keyof typeof PLAYER_STATUS];

// 難易度定数
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

// エラーコード定数
export const ERROR_CODES = {
  // 認証エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // 入力エラー
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // リソースエラー
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // ゲームエラー
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  INVALID_GAME_STATE: 'INVALID_GAME_STATE',
  ALREADY_ANSWERED: 'ALREADY_ANSWERED',
  ALREADY_VOTED: 'ALREADY_VOTED',
  
  // WebSocketエラー
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  MESSAGE_FORMAT_ERROR: 'MESSAGE_FORMAT_ERROR',
  
  // サーバーエラー
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ログレベル定数
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

// 設定の型安全性チェック関数
export function isValidGamePhase(phase: string): phase is GamePhase {
  return Object.values(GAME_PHASES).includes(phase as GamePhase);
}

export function isValidRoomStatus(status: string): status is RoomStatus {
  return Object.values(ROOM_STATUS).includes(status as RoomStatus);
}

export function isValidPlayerStatus(status: string): status is PlayerStatus {
  return Object.values(PLAYER_STATUS).includes(status as PlayerStatus);
}

export function isValidDifficultyLevel(level: string): level is DifficultyLevel {
  return Object.values(DIFFICULTY_LEVELS).includes(level as DifficultyLevel);
}