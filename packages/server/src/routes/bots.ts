import { Router } from 'express';
import { query } from '../db.js';
import type { BotRecord } from '@dojo-chess/shared';

export const botsRouter = Router();

botsRouter.post('/', async (req, res) => {
  const { name, code } = req.body as { name?: string; code?: string };
  if (!name || !code) {
    res.status(400).json({ error: 'name and code are required' });
    return;
  }
  const rows = await query<BotRecord>(
    'INSERT INTO bots (name, code) VALUES ($1, $2) RETURNING id, user_id AS "userId", name, code, created_at AS "createdAt"',
    [name, code]
  );
  res.status(201).json(rows[0]);
});

botsRouter.get('/', async (_req, res) => {
  const rows = await query<Omit<BotRecord, 'code'>>(
    'SELECT id, user_id AS "userId", name, created_at AS "createdAt" FROM bots ORDER BY created_at DESC'
  );
  res.json(rows);
});

botsRouter.get('/:id', async (req, res) => {
  const rows = await query<BotRecord>(
    'SELECT id, user_id AS "userId", name, code, created_at AS "createdAt" FROM bots WHERE id = $1',
    [req.params['id']]
  );
  if (!rows[0]) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(rows[0]);
});
