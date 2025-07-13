/**
 * WebSocket関連の型定義
 */

import { WebSocket } from 'ws';

// WebSocketメッセージの基本型
export interface GameMessage {
  type: string;
  sessionId: string;
  userId?: string;
  data?: unknown;
  timestamp: number;
}

// 具体的なメッセージ型
export interface JoinMessage extends Omit<GameMessage, 'type' | 'data'> {
  type: 'join';
  userId: string;
  data?: never;
}

export interface LeaveMessage extends Omit<GameMessage, 'type' | 'data'> {
  type: 'leave';
  userId: string;
  data?: never;
}

export interface AnswerMessage extends Omit<GameMessage, 'type'> {
  type: 'answer';
  userId: string;
  data: {
    hasAnswered: boolean;
  };
}

export interface VoteMessage extends Omit<GameMessage, 'type'> {
  type: 'vote';
  userId: string;
  data: {
    hasVoted: boolean;
  };
}

export interface GameStateMessage extends Omit<GameMessage, 'type'> {
  type: 'game_state';
  data: {
    phase: GamePhase;
    timeLeft?: number;
    players: GamePlayer[];
    currentRound?: number;
    totalRounds?: number;
  };
}

export interface QuestionMessage extends Omit<GameMessage, 'type'> {
  type: 'question';
  data: {
    id: string;
    content: string;
    category?: string;
    timeLimit: number;
  };
}

export interface ResultsMessage extends Omit<GameMessage, 'type'> {
  type: 'results';
  data: {
    answers: AnswerResult[];
    winner?: {
      userId: string;
      answerId: string;
      votes: number;
    };
    scores: PlayerScore[];
  };
}

export interface ScoreUpdateMessage extends Omit<GameMessage, 'type'> {
  type: 'score_update';
  data: {
    scores: PlayerScore[];
    roundWinner?: {
      userId: string;
      answerId: string;
      votes: number;
    };
  };
}

export interface ErrorMessage extends Omit<GameMessage, 'type'> {
  type: 'error';
  data: {
    error: string;
    code?: string;
  };
}

// Union型でメッセージタイプを統合
export type WebSocketMessage = 
  | JoinMessage 
  | LeaveMessage 
  | AnswerMessage 
  | VoteMessage 
  | GameStateMessage 
  | QuestionMessage 
  | ResultsMessage 
  | ScoreUpdateMessage
  | ErrorMessage;

// 接続クライアント
export interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  sessionId: string;
  lastPing: number;
}

// ゲーム関連の型
export type GamePhase = 'waiting' | 'question' | 'answering' | 'voting' | 'results' | 'finished';

export interface GamePlayer {
  id: string;
  name: string;
  hasAnswered: boolean;
  hasVoted: boolean;
  score: number;
  status: 'connected' | 'disconnected';
}

export interface AnswerResult {
  id: string;
  userId: string;
  content: string;
  votes: number;
  isWinner: boolean;
}

export interface PlayerScore {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

// WebSocketサーバーのイベントハンドラー型
export interface WebSocketEventHandlers {
  onJoin: (client: ConnectedClient, message: JoinMessage) => void;
  onLeave: (client: ConnectedClient, message: LeaveMessage) => void;
  onAnswer: (client: ConnectedClient, message: AnswerMessage) => void;
  onVote: (client: ConnectedClient, message: VoteMessage) => void;
  onDisconnect: (client: ConnectedClient) => void;
  onError: (client: ConnectedClient, error: Error) => void;
}

// クライアント側のイベントハンドラー型
export interface WebSocketClientEventHandlers {
  onJoin: (message: JoinMessage) => void;
  onLeave: (message: LeaveMessage) => void;
  onGameState: (message: GameStateMessage) => void;
  onQuestion: (message: QuestionMessage) => void;
  onResults: (message: ResultsMessage) => void;
  onScoreUpdate: (message: ScoreUpdateMessage) => void;
  onError: (message: ErrorMessage) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}