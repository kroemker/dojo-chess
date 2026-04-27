import type { BotRecord, GameState } from '@dojo-chess/shared';

export async function saveBotApi(name: string, code: string): Promise<BotRecord> {
  const res = await fetch('/bots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, code }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<BotRecord>;
}

export async function listBotsApi(): Promise<Omit<BotRecord, 'code'>[]> {
  const res = await fetch('/bots');
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Omit<BotRecord, 'code'>[]>;
}

export async function startGameApi(whiteBotId: number, blackBotId: number): Promise<{ gameId: string }> {
  const res = await fetch('/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ whiteBotId, blackBotId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ gameId: string }>;
}

export async function getGameApi(gameId: string): Promise<GameState> {
  const res = await fetch(`/games/${gameId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<GameState>;
}
