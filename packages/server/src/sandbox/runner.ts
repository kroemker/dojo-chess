import vm from 'node:vm';
import type { BotGameState, Move, Square } from '@dojo-chess/shared';
import { BOT_TIMEOUT_MS } from '../chess/constants.js';
import { computePossibleMoves } from '../chess/moves.js';

function isValidMoveShape(m: unknown): m is Move {
  if (!m || typeof m !== 'object') return false;
  const mv = m as Record<string, unknown>;
  const from = mv['from'] as Record<string, unknown> | undefined;
  const to = mv['to'] as Record<string, unknown> | undefined;
  return (
    typeof from?.['row'] === 'number' &&
    typeof from?.['col'] === 'number' &&
    typeof to?.['row'] === 'number' &&
    typeof to?.['col'] === 'number'
  );
}

export function runBot(code: string, gameState: BotGameState): Move | null {
  // Deep clone so bot code cannot mutate server state
  const stateClone: BotGameState = JSON.parse(JSON.stringify(gameState));

  // Bind getPossibleMoves to the cloned state so it can't be retargeted
  const getPossibleMoves = (sq: Square) => computePossibleMoves(stateClone, sq);

  const sandbox = {
    __gameState__: stateClone,
    __result__: null as Move | null,
    getPossibleMoves,
    Math,
    JSON,
    Array,
    Object,
    console: { log: () => {}, error: () => {}, warn: () => {} },
    // Intentionally omitted: require, process, fetch, Promise, setTimeout, setInterval, fs, Buffer
  };

  const wrapped = `${code}\n__result__ = (typeof makeMove === 'function') ? makeMove(__gameState__) : null;`;

  try {
    vm.runInNewContext(wrapped, sandbox, { timeout: BOT_TIMEOUT_MS, filename: 'bot.js' });
    const result = sandbox.__result__;
    return isValidMoveShape(result) ? result : null;
  } catch {
    // Covers: ERR_SCRIPT_EXECUTION_TIMEOUT, SyntaxError, ReferenceError, and any bot-thrown errors
    return null;
  }
}
