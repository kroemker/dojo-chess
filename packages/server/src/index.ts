import express from 'express';
import http from 'node:http';
import { WebSocketServer } from 'ws';
import { botsRouter } from './routes/bots.js';
import { gamesRouter } from './routes/games.js';
import { gameManager } from './game/GameManager.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

const app = express();
app.use(express.json());

app.use('/bots', botsRouter);
app.use('/games', gamesRouter);

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const match = req.url?.match(/^\/games\/([^/?]+)/);
  if (!match) {
    ws.close(4000, 'URL must be /games/:gameId');
    return;
  }
  const gameId = match[1];
  const room = gameManager.getRoom(gameId);
  if (!room) {
    ws.close(4004, 'Game not found');
    return;
  }
  room.addObserver(ws);
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/games/:gameId`);
});
