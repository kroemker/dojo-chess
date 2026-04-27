import type { Board, Color, GameState, Move } from '@dojo-chess/shared';
import { COOLDOWN_MS } from './constants.js';
import { initBoard } from './board.js';

export function createInitialGameState(gameId: string): GameState {
  return {
    gameId,
    board: initBoard(),
    phase: 'waiting',
    winner: null,
    serverTime: Date.now(),
    moveCount: 0,
  };
}

function checkWin(board: Board): Color | null {
  let whiteKing = false;
  let blackKing = false;
  for (const row of board) {
    for (const piece of row) {
      if (piece?.type === 'king') {
        if (piece.color === 'white') whiteKing = true;
        else blackKing = true;
      }
    }
  }
  if (!whiteKing) return 'black';
  if (!blackKing) return 'white';
  return null;
}

export function applyMove(state: GameState, move: Move, color: Color): GameState {
  // Deep clone via JSON round-trip — acceptable at 100ms tick rate on 8x8 board
  const next: GameState = JSON.parse(JSON.stringify(state));
  const piece = next.board[move.from.row][move.from.col];
  if (!piece || piece.color !== color) return state;

  piece.cooldownUntil = Date.now() + COOLDOWN_MS;
  next.board[move.to.row][move.to.col] = piece;
  next.board[move.from.row][move.from.col] = null;
  next.moveCount++;

  const winner = checkWin(next.board);
  if (winner) {
    next.phase = 'finished';
    next.winner = winner;
  }

  return next;
}
