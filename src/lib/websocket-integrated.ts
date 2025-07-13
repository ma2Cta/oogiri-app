// 本番環境用: Next.jsサーバーに統合されたWebSocketサーバー

import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GameMessage, ConnectedClient, JoinMessage } from './types/websocket';

export class IntegratedWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private sessions: Map<string, Set<string>> = new Map();

  init(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (data: Buffer) => {
        try {
          const message: GameMessage = JSON.parse(data.toString());
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

      ws.ping();
    });

    console.log('Integrated WebSocket server initialized');
  }

  private handleMessage(ws: WebSocket, message: GameMessage) {
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
    
    if (this.clients.has(clientId)) {
      const existingClient = this.clients.get(clientId);
      existingClient?.ws.close();
    }

    this.clients.set(clientId, {
      ws,
      userId,
      sessionId,
      lastPing: Date.now()
    });

    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Set());
    }
    this.sessions.get(sessionId)!.add(clientId);

    console.log(`User ${userId} joined session ${sessionId}`);
    
    this.broadcastToSession(sessionId, {
      type: 'join',
      sessionId,
      data: { userId },
      timestamp: Date.now()
    });

    this.sendToClient(ws, {
      type: 'join',
      sessionId,
      data: { success: true, connectedUsers: this.getSessionUsers(sessionId) },
      timestamp: Date.now()
    });
  }

  private handleLeave(ws: WebSocket, message: GameMessage) {
    const { sessionId, userId } = message;
    
    if (!sessionId || !userId) {
      return;
    }

    const clientId = `${sessionId}:${userId}`;
    this.removeClient(clientId);
  }

  private handleAnswer(message: GameMessage) {
    this.broadcastToSession(message.sessionId, {
      type: 'answer',
      sessionId: message.sessionId,
      data: { userId: message.userId, hasAnswered: true },
      timestamp: Date.now()
    });
  }

  private handleVote(message: GameMessage) {
    this.broadcastToSession(message.sessionId, {
      type: 'vote',
      sessionId: message.sessionId,
      data: { userId: message.userId, hasVoted: true },
      timestamp: Date.now()
    });
  }

  private handleGameState(ws: WebSocket, message: GameMessage) {
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
    
    this.clients.delete(clientId);
    
    const sessionClients = this.sessions.get(sessionId);
    if (sessionClients) {
      sessionClients.delete(clientId);
      
      if (sessionClients.size === 0) {
        this.sessions.delete(sessionId);
      } else {
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

  private broadcastToSession(sessionId: string, message: GameMessage) {
    const sessionClients = this.sessions.get(sessionId);
    if (!sessionClients) return;

    for (const clientId of sessionClients) {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === 1) {
        this.sendToClient(client.ws, message);
      }
    }
  }

  private sendToClient(ws: WebSocket, message: GameMessage) {
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

  public broadcastGameState(sessionId: string, gameState: unknown) {
    this.broadcastToSession(sessionId, {
      type: 'game_state',
      sessionId,
      data: gameState,
      timestamp: Date.now()
    });
  }

  public broadcastQuestion(sessionId: string, question: unknown) {
    this.broadcastToSession(sessionId, {
      type: 'question',
      sessionId,
      data: question,
      timestamp: Date.now()
    });
  }

  public broadcastResults(sessionId: string, results: unknown) {
    this.broadcastToSession(sessionId, {
      type: 'results',
      sessionId,
      data: results,
      timestamp: Date.now()
    });
  }
}

export const integratedWsServer = new IntegratedWebSocketServer();