/**
 * 構造化ログシステム
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: unknown;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  roomId?: string;
  timestamp?: string;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: Error;
  context?: LogContext;
  timestamp: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(entry: LogEntry): string {
    const { level, message, error, context, timestamp } = entry;
    
    if (this.isDevelopment) {
      // 開発環境: 読みやすい形式
      const contextStr = context ? ` | Context: ${JSON.stringify(context, null, 2)}` : '';
      const errorStr = error ? ` | Error: ${error.message}\nStack: ${error.stack}` : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
    } else {
      // 本番環境: JSON形式
      return JSON.stringify({
        timestamp,
        level,
        message,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : undefined,
        context
      });
    }
  }

  private log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
    const entry: LogEntry = {
      level,
      message,
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'info':
        console.info(formattedLog);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
    }

    // 本番環境では外部ログサービスに送信することも可能
    if (this.isProduction && level === 'error') {
      // TODO: 外部ログサービス (Sentry, LogRocket等) への送信
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // 外部ログサービスへの送信ロジック
    // 例: Sentry, LogRocket, CloudWatch Logs等
    // 現在は未実装
    console.debug('External logging service call (not implemented):', entry.level);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, error, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, undefined, context);
  }

  // APIリクエスト用のコンテキスト付きロガー
  withContext(baseContext: LogContext) {
    return {
      error: (message: string, error?: Error, additionalContext?: LogContext) => 
        this.error(message, error, { ...baseContext, ...additionalContext }),
      warn: (message: string, additionalContext?: LogContext) => 
        this.warn(message, { ...baseContext, ...additionalContext }),
      info: (message: string, additionalContext?: LogContext) => 
        this.info(message, { ...baseContext, ...additionalContext }),
      debug: (message: string, additionalContext?: LogContext) => 
        this.debug(message, { ...baseContext, ...additionalContext })
    };
  }


  // API専用ロガー
  api = {
    request: (method: string, path: string, userId?: string, requestId?: string) => 
      this.info('API request', { method, path, userId, requestId }),
    response: (method: string, path: string, status: number, duration: number, userId?: string, requestId?: string) => 
      this.info('API response', { method, path, status, duration, userId, requestId }),
    error: (method: string, path: string, error: Error, userId?: string, requestId?: string) => 
      this.error('API error', error, { method, path, userId, requestId }),
    validation: (field: string, value: unknown, error: string, userId?: string, requestId?: string) => 
      this.warn('API validation error', { field, value, validationError: error, userId, requestId })
  };

  // ゲーム専用ロガー
  game = {
    sessionStart: (sessionId: string, hostId: string, playerCount: number) => 
      this.info('Game session started', { sessionId, hostId, playerCount }),
    sessionEnd: (sessionId: string, duration: number, playerCount: number) => 
      this.info('Game session ended', { sessionId, duration, playerCount }),
    roundStart: (sessionId: string, round: number, questionId: string) => 
      this.info('Game round started', { sessionId, round, questionId }),
    roundEnd: (sessionId: string, round: number, winnerId?: string) => 
      this.info('Game round ended', { sessionId, round, winnerId }),
    playerJoin: (sessionId: string, userId: string) => 
      this.info('Player joined game', { sessionId, userId }),
    playerLeave: (sessionId: string, userId: string) => 
      this.info('Player left game', { sessionId, userId }),
    answer: (sessionId: string, userId: string, round: number) => 
      this.debug('Answer submitted', { sessionId, userId, round }),
    vote: (sessionId: string, voterId: string, answerId: string, round: number) => 
      this.debug('Vote submitted', { sessionId, voterId, answerId, round })
  };
}

export const logger = new Logger();

// リクエストID生成ユーティリティ
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}