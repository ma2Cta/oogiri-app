import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { 
  WebSocketMessage, 
  ConnectedClient, 
  JoinMessage, 
  LeaveMessage, 
  AnswerMessage, 
  VoteMessage,
} from './types/websocket';

import { config } from './config';

class GameWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private sessions: Map<string, Set<string>> = new Map();
  private isServerStarted = false;

  constructor() {
    // サーバーは必要に応じて遅延起動
  }

  private ensureServerStarted() {
    if (this.isServerStarted || this.wss) {
      return;
    }

    try {
      const port = config.websocketPort;
      this.wss = new WebSocketServer({ port });
      this.wss.on('connection', this.handleConnection.bind(this));
      this.startHeartbeat();
      this.isServerStarted = true;
      
      console.log(`WebSocket server listening on port ${port}`);
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${config.websocketPort} is already in use, using existing server`);
        this.isServerStarted = true;
        return;
      }
      throw error;
    }
  }

  // 実際のHTTPサーバーと統合する場合のメソッド
  public attachToServer(server: Server) {
    const port = config.websocketPort;
    this.wss = new WebSocketServer({ server });
    this.wss.on('connection', this.handleConnection.bind(this));
    
    server.listen(port, () => {
      console.log(`WebSocket server running on ws://localhost:${port}`);
    });
  }

  private handleConnection(ws: WebSocket) {
    console.log('New WebSocket connection');
    
    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Invalid message format:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    // 初期pingを送信
    ws.ping();
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'join':
        this.handleJoin(ws, message);
        break;
      case 'leave':
        this.handleLeave(ws, message);
        break;
      case 'answer':
        this.handleAnswer(message);
        break;
      case 'vote':
        this.handleVote(message);
        break;
      case 'game_state':
        this.handleGameState(ws, message);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  private handleJoin(ws: WebSocket, message: JoinMessage) {
    const { sessionId, userId } = message;
    
    if (!sessionId || !userId) {
      this.sendError(ws, 'sessionId and userId are required for join');
      return;
    }

    const clientId = `${sessionId}:${userId}`;
    
    // 既存の接続を削除
    if (this.clients.has(clientId)) {
      const existingClient = this.clients.get(clientId);
      existingClient?.ws.close();
    }

    // 新しいクライアントを登録
    this.clients.set(clientId, {
      ws,
      userId,
      sessionId,
      lastPing: Date.now()
    });

    // セッションにクライアントを追加
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Set());
    }
    this.sessions.get(sessionId)!.add(clientId);

    console.log(`User ${userId} joined session ${sessionId}`);
    
    // セッションの他の参加者に通知
    this.broadcastToSession(sessionId, {
      type: 'join',
      sessionId,
      data: { userId },
      timestamp: Date.now()
    });

    // 接続確認を送信
    this.sendToClient(ws, {
      type: 'join',
      sessionId,
      data: { success: true, connectedUsers: this.getSessionUsers(sessionId) },
      timestamp: Date.now()
    });
  }

  private handleLeave(ws: WebSocket, message: LeaveMessage) {
    const { sessionId, userId } = message;
    
    if (!sessionId || !userId) {
      return;
    }

    const clientId = `${sessionId}:${userId}`;
    this.removeClient(clientId);
  }

  private handleAnswer(message: AnswerMessage) {
    // 回答をセッションの他の参加者に通知
    this.broadcastToSession(message.sessionId, {
      type: 'answer',
      sessionId: message.sessionId,
      data: { userId: message.userId, hasAnswered: true },
      timestamp: Date.now()
    });
  }

  private handleVote(message: VoteMessage) {
    // 投票をセッションの他の参加者に通知
    this.broadcastToSession(message.sessionId, {
      type: 'vote',
      sessionId: message.sessionId,
      data: { userId: message.userId, hasVoted: true },
      timestamp: Date.now()
    });
  }

  private handleGameState(ws: WebSocket, message: WebSocketMessage) {
    // ゲーム状態の更新要求を処理
    console.log('Game state request received:', message);
    
    // 現在のゲーム状態を返す、または状態更新を処理
    if (message.sessionId) {
      this.broadcastToSession(message.sessionId, {
        type: 'game_state',
        data: { status: 'updated' },
        sessionId: message.sessionId,
        timestamp: Date.now()
      });
    }
  }

  private handleDisconnection(ws: WebSocket) {
    // WebSocketから該当するクライアントを見つけて削除
    for (const [clientId, client] of this.clients.entries()) {
      if (client.ws === ws) {
        this.removeClient(clientId);
        break;
      }
    }
  }

  private removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { sessionId, userId } = client;
    
    // クライアントを削除
    this.clients.delete(clientId);
    
    // セッションからも削除
    const sessionClients = this.sessions.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(clientId);
      
      // セッションが空になったら削除
      if (sessionClients.size === 0) {
        this.sessions.delete(sessionId);
      } else {
        // セッションの他の参加者に通知
        this.broadcastToSession(sessionId, {
          type: 'leave',
          sessionId,
          data: { userId },
          timestamp: Date.now()
        });
      }
    }

    console.log(`User ${userId} left session ${sessionId}`);
  }

  private broadcastToSession(sessionId: string, message: WebSocketMessage) {
    const sessionClients = this.sessions.get(sessionId);
    if (!sessionClients) return;

    for (const clientId of sessionClients) {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === 1) { // WebSocket.OPEN
        this.sendToClient(client.ws, message);
      }
    }
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message to client:', error);
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendToClient(ws, {
      type: 'error',
      sessionId: '',
      data: { error },
      timestamp: Date.now()
    });
  }

  private getSessionUsers(sessionId: string): string[] {
    const sessionClients = this.sessions.get(sessionId);
    if (!sessionClients) return [];

    const users: string[] = [];
    for (const clientId of sessionClients) {
      const client = this.clients.get(clientId);
      if (client) {
        users.push(client.userId);
      }
    }
    return users;
  }

  // API経由でゲーム状態変更を通知する公開メソッド
  public notifyGameStateChange(sessionId: string, gameState: unknown) {
    this.ensureServerStarted();
    this.broadcastToSession(sessionId, {
      type: 'game_state',
      sessionId,
      data: gameState,
      timestamp: Date.now()
    });
  }

  private startHeartbeat() {
    if (!this.wss) return;
    
    setInterval(() => {
      const now = Date.now();
      for (const [clientId, client] of this.clients.entries()) {
        if (now - client.lastPing > 30000) { // 30秒以上応答なし
          console.log(`Client ${clientId} timed out`);
          client.ws.close();
          this.removeClient(clientId);
        } else if (client.ws.readyState === 1) {
          client.ws.ping();
        }
      }
    }, 10000); // 10秒ごとにチェック
  }

  // ゲーム状態の更新を送信
  public broadcastGameState(sessionId: string, gameState: unknown) {
    this.ensureServerStarted();
    this.broadcastToSession(sessionId, {
      type: 'game_state',
      sessionId,
      data: gameState,
      timestamp: Date.now()
    });
  }

  // 質問の送信
  public broadcastQuestion(sessionId: string, question: unknown) {
    this.ensureServerStarted();
    this.broadcastToSession(sessionId, {
      type: 'question',
      sessionId,
      data: question,
      timestamp: Date.now()
    });
  }

  // 結果の送信
  public broadcastResults(sessionId: string, results: unknown) {
    this.ensureServerStarted();
    this.broadcastToSession(sessionId, {
      type: 'results',
      sessionId,
      data: results,
      timestamp: Date.now()
    });
  }

  // スコア更新の送信
  public broadcastScoreUpdate(sessionId: string, scoreData: unknown) {
    this.ensureServerStarted();
    this.broadcastToSession(sessionId, {
      type: 'score_update',
      sessionId,
      data: scoreData,
      timestamp: Date.now()
    });
  }
}

// サーバーの初期化（シングルトン）
let wsServer: GameWebSocketServer | null = null;

export function getWebSocketServer(): GameWebSocketServer {
  if (!wsServer) {
    wsServer = new GameWebSocketServer();
  }
  return wsServer;
}

// 開発環境でのサーバー起動（別途server.jsで管理）
// WebSocketサーバーはAPI経由でのみ使用する場合はここでは起動しない