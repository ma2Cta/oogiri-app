const { getWebSocketServer } = require('../src/lib/websocket-server.ts');

// WebSocketサーバーを起動
console.log('Starting WebSocket server...');
getWebSocketServer();