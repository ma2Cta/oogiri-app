// 本番環境用のカスタムサーバー（WebSocket統合）

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// WebSocket管理
const clients = new Map();
const sessions = new Map();

function handleWebSocketConnection(ws, request) {
  console.log('New WebSocket connection');
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(ws, message);
    } catch (error) {
      console.error('Invalid message format:', error);
      ws.send(JSON.stringify({
        type: 'error',
        sessionId: '',
        data: { error: 'Invalid message format' },
        timestamp: Date.now()
      }));
    }
  });

  ws.on('close', () => {
    handleWebSocketDisconnection(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.ping();
}

function handleWebSocketMessage(ws, message) {
  switch (message.type) {
    case 'join':
      handleJoin(ws, message);
      break;
    case 'leave':
      handleLeave(ws, message);
      break;
    case 'answer':
      handleAnswer(message);
      break;
    case 'vote':
      handleVote(message);
      break;
    default:
      ws.send(JSON.stringify({
        type: 'error',
        sessionId: '',
        data: { error: `Unknown message type: ${message.type}` },
        timestamp: Date.now()
      }));
  }
}

function handleJoin(ws, message) {
  const { sessionId, userId } = message;
  
  if (!sessionId || !userId) {
    ws.send(JSON.stringify({
      type: 'error',
      sessionId: '',
      data: { error: 'sessionId and userId are required for join' },
      timestamp: Date.now()
    }));
    return;
  }

  const clientId = `${sessionId}:${userId}`;
  
  if (clients.has(clientId)) {
    const existingClient = clients.get(clientId);
    existingClient.ws.close();
  }

  clients.set(clientId, {
    ws,
    userId,
    sessionId,
    lastPing: Date.now()
  });

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new Set());
  }
  sessions.get(sessionId).add(clientId);

  console.log(`User ${userId} joined session ${sessionId}`);
  
  broadcastToSession(sessionId, {
    type: 'join',
    sessionId,
    data: { userId },
    timestamp: Date.now()
  });

  ws.send(JSON.stringify({
    type: 'join',
    sessionId,
    data: { success: true, connectedUsers: getSessionUsers(sessionId) },
    timestamp: Date.now()
  }));
}

function handleLeave(ws, message) {
  const { sessionId, userId } = message;
  
  if (!sessionId || !userId) {
    return;
  }

  const clientId = `${sessionId}:${userId}`;
  removeClient(clientId);
}

function handleAnswer(message) {
  broadcastToSession(message.sessionId, {
    type: 'answer',
    sessionId: message.sessionId,
    data: { userId: message.userId, hasAnswered: true },
    timestamp: Date.now()
  });
}

function handleVote(message) {
  broadcastToSession(message.sessionId, {
    type: 'vote',
    sessionId: message.sessionId,
    data: { userId: message.userId, hasVoted: true },
    timestamp: Date.now()
  });
}

function handleWebSocketDisconnection(ws) {
  for (const [clientId, client] of clients.entries()) {
    if (client.ws === ws) {
      removeClient(clientId);
      break;
    }
  }
}

function removeClient(clientId) {
  const client = clients.get(clientId);
  if (!client) return;

  const { sessionId, userId } = client;
  
  clients.delete(clientId);
  
  const sessionClients = sessions.get(sessionId);
  if (sessionClients) {
    sessionClients.delete(clientId);
    
    if (sessionClients.size === 0) {
      sessions.delete(sessionId);
    } else {
      broadcastToSession(sessionId, {
        type: 'leave',
        sessionId,
        data: { userId },
        timestamp: Date.now()
      });
    }
  }

  console.log(`User ${userId} left session ${sessionId}`);
}

function broadcastToSession(sessionId, message) {
  const sessionClients = sessions.get(sessionId);
  if (!sessionClients) return;

  for (const clientId of sessionClients) {
    const client = clients.get(clientId);
    if (client && client.ws.readyState === 1) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send message to client:', error);
      }
    }
  }
}

function getSessionUsers(sessionId) {
  const sessionClients = sessions.get(sessionId);
  if (!sessionClients) return [];

  const users = [];
  for (const clientId of sessionClients) {
    const client = clients.get(clientId);
    if (client) {
      users.push(client.userId);
    }
  }
  return users;
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // WebSocketサーバーをHTTPサーバーに統合
  const wss = new WebSocketServer({ server });
  wss.on('connection', handleWebSocketConnection);

  // ヘルスチェック
  setInterval(() => {
    const now = Date.now();
    for (const [clientId, client] of clients.entries()) {
      if (now - client.lastPing > 30000) {
        console.log(`Client ${clientId} timed out`);
        client.ws.close();
        removeClient(clientId);
      } else if (client.ws.readyState === 1) {
        client.ws.ping();
      }
    }
  }, 10000);

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready`);
  });
});