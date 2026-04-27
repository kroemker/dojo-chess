import { Router } from 'express';
import { query } from '../db.js';
import { gameManager } from '../game/GameManager.js';
import type { BotRecord, GameRecord } from '@dojo-chess/shared';

export const gamesRouter = Router();

gamesRouter.post('/', async (req, res) => {
  const { whiteBotId, blackBotId } = req.body as { whiteBotId?: number; blackBotId?: number };
  if (!whiteBotId || !blackBotId) {
    res.status(400).json({ error: 'whiteBotId and blackBotId are required' });
    return;
  }

  const bots = await query<Pick<BotRecord, 'id' | 'code'>>(
    'SELECT id, code FROM bots WHERE id = ANY($1)',
    [[whiteBotId, blackBotId]]
  );

  const whiteBot = bots.find(b => b.id === whiteBotId);
  const blackBot = bots.find(b => b.id === blackBotId);

  if (!whiteBot || !blackBot) {
    res.status(404).json({ error: 'One or both bots not found' });
    return;
  }

  const [gameRow] = await query<{ id: string }>(
    'INSERT INTO games (white_bot_id, black_bot_id, phase) VALUES ($1, $2, $3) RETURNING id',
    [whiteBotId, blackBotId, 'playing']
  );
  const gameId = gameRow.id;

  const room = gameManager.createGame(gameId, whiteBot.code, blackBot.code);
  room.start();

  res.status(201).json({ gameId });
});

gamesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const room = gameManager.getRoom(id);
  if (room) {
    res.json(room.getState());
    return;
  }

  const rows = await query<GameRecord>(
    `SELECT id, white_bot_id AS "whiteBotId", black_bot_id AS "blackBotId", phase, winner
     FROM games WHERE id = $1`,
    [id]
  );
  if (!rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(rows[0]);
});
