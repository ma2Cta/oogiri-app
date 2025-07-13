'use client';

import { useState, useEffect } from 'react';
import { GameMessage } from './websocket-server';

export type GameEventHandler = (message: GameMessage) => void;

export class GameWebSocketClient {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private userId: string;
  private eventHandlers: Map<string, GameEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // 最大試行回数を削減
  private reconnectDelay = 3000; // 初期遅延を3秒に増加
  private initialConnectionDelay = 2000; // 初回接続の遅延

  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 既に接続中または接続済みの場合は何もしない
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
          console.log('WebSocket already connected or connecting, skipping...');
          resolve();
          return;
        }

        // 既存のWebSocketがある場合はクリーンアップ
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }

        // 初回接続時は少し待つ（サーバーの起動を待つ）
        const delay = this.reconnectAttempts === 0 ? this.initialConnectionDelay : 0;
        
        setTimeout(() => {
          this.attemptConnection(resolve, reject);
        }, delay);

      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptConnection(resolve: () => void, reject: (error: Error) => void): void {
    try {
      // 環境に応じてWebSocket URLを決定
      const wsUrl = process.env.NODE_ENV === 'production'
        ? `wss://${window.location.host}`
        : 'ws://localhost:3001';
      
      console.log(`Attempting to connect to WebSocket: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);
      
      // 接続タイムアウトを設定
      const connectTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket connection timeout');
          this.ws.close();
          reject(new Error('Connection timeout'));
        }
      }, 10000); // 10秒でタイムアウト
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        clearTimeout(connectTimeout);
        this.reconnectAttempts = 0;
        
        // 接続イベントを発火
        this.emit('connect', {
          type: 'connect',
          data: { success: true },
          sessionId: this.sessionId,
          timestamp: Date.now()
        });
        
        // セッションに参加
        this.send({
          type: 'join',
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now()
        });
        
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: GameMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        clearTimeout(connectTimeout);
        
        // 切断イベントを発火
        this.emit('disconnect', {
          type: 'disconnect',
          data: { code: event.code, reason: event.reason },
          sessionId: this.sessionId,
          timestamp: Date.now()
        });
        
        this.handleDisconnection();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        clearTimeout(connectTimeout);
        reject(new Error('WebSocket connection failed'));
      };

    } catch (error) {
      reject(error instanceof Error ? error : new Error('Connection setup failed'));
    }
  }

  disconnect(): void {
    if (this.ws) {
      // 離脱メッセージを送信
      this.send({
        type: 'leave',
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now()
      });
      
      // 再接続を停止
      this.reconnectAttempts = this.maxReconnectAttempts;
      
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: Omit<GameMessage, 'sessionId'> & { sessionId?: string }): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: GameMessage = {
        ...message,
        sessionId: message.sessionId || this.sessionId,
      };
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // イベントハンドラーの登録
  on(eventType: string, handler: GameEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  // イベントハンドラーの削除
  off(eventType: string, handler: GameEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // すべてのイベントハンドラーをクリア
  removeAllListeners(): void {
    this.eventHandlers.clear();
  }

  // イベントを発火
  private emit(eventType: string, message: GameMessage): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
  }

  private handleMessage(message: GameMessage): void {
    console.log('Received WebSocket message:', message);
    
    // 型別のハンドラーを実行
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    // 汎用ハンドラーを実行
    const allHandlers = this.eventHandlers.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => handler(message));
    }
  }

  private handleDisconnection(): void {
    // 手動で切断された場合は再接続しない
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      console.log('WebSocket manually disconnected, not attempting reconnection');
      return;
    }

    // 再接続を試行
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数バックオフ
      setTimeout(() => {
        // 再接続試行前に現在の状態を確認
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          console.log('Already reconnected, cancelling attempt');
          return;
        }
        
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      // 接続失敗を通知
      const handlers = this.eventHandlers.get('connection_failed');
      if (handlers) {
        handlers.forEach(handler => handler({
          type: 'error',
          sessionId: this.sessionId,
          data: { error: 'Connection failed after multiple attempts' },
          timestamp: Date.now()
        }));
      }
    }
  }

  // 接続状態を確認
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ゲーム固有のメソッド
  submitAnswer(content: string): void {
    this.send({
      type: 'answer',
      userId: this.userId,
      data: { content },
      timestamp: Date.now()
    });
  }

  submitVote(answerId: string): void {
    this.send({
      type: 'vote',
      userId: this.userId,
      data: { answerId },
      timestamp: Date.now()
    });
  }
}

// React Hook用のカスタムフック
export function useGameWebSocket(sessionId: string, userId: string) {
  const [client, setClient] = useState<GameWebSocketClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wsClient = new GameWebSocketClient(sessionId, userId);
    
    wsClient.on('join', (message) => {
      if (message.data?.success) {
        setConnected(true);
        setError(null);
      }
    });

    wsClient.on('error', (message) => {
      setError(message.data?.error || 'Unknown error');
    });

    wsClient.on('connection_failed', (message) => {
      setConnected(false);
      setError(message.data?.error || 'Connection failed');
    });

    wsClient.connect().catch(err => {
      setError(err.message);
    });

    setClient(wsClient);

    return () => {
      wsClient.disconnect();
    };
  }, [sessionId, userId]);

  return { client, connected, error };
}

