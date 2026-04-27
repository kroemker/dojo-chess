import type { Board, BotGameState, Color, Move, Square } from '@dojo-chess/shared';
import { BOARD_SIZE } from './constants.js';

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/** Slide along a direction vector, collecting squares until blocked. */
function slidingTargets(board: Board, from: Square, dirs: [number, number][], color: Color): Square[] {
  const targets: Square[] = [];
  for (const [dr, dc] of dirs) {
    let r = from.row + dr;
    let c = from.col + dc;
    while (inBounds(r, c)) {
      const occupant = board[r][c];
      if (occupant) {
        if (occupant.color !== color) targets.push({ row: r, col: c }); // capture
        break;
      }
      targets.push({ row: r, col: c });
      r += dr;
      c += dc;
    }
  }
  return targets;
}

function jumpTargets(board: Board, from: Square, offsets: [number, number][], color: Color): Square[] {
  return offsets
    .map(([dr, dc]) => ({ row: from.row + dr, col: from.col + dc }))
    .filter(sq => inBounds(sq.row, sq.col) && board[sq.row][sq.col]?.color !== color);
}

function pawnTargets(board: Board, from: Square, color: Color): Square[] {
  const dir = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;
  const targets: Square[] = [];

  // Forward 1
  const r1 = from.row + dir;
  if (inBounds(r1, from.col) && !board[r1][from.col]) {
    targets.push({ row: r1, col: from.col });
    // Forward 2 from starting rank
    const r2 = from.row + dir * 2;
    if (from.row === startRow && inBounds(r2, from.col) && !board[r2][from.col]) {
      targets.push({ row: r2, col: from.col });
    }
  }
  // Diagonal captures
  for (const dc of [-1, 1]) {
    const rc = from.row + dir;
    const cc = from.col + dc;
    if (inBounds(rc, cc) && board[rc][cc]?.color === (color === 'white' ? 'black' : 'white')) {
      targets.push({ row: rc, col: cc });
    }
  }
  return targets;
}

function legalTargets(board: Board, from: Square, color: Color): Square[] {
  const piece = board[from.row][from.col];
  if (!piece || piece.color !== color) return [];

  switch (piece.type) {
    case 'rook':
      return slidingTargets(board, from, [[1,0],[-1,0],[0,1],[0,-1]], color);
    case 'bishop':
      return slidingTargets(board, from, [[1,1],[1,-1],[-1,1],[-1,-1]], color);
    case 'queen':
      return slidingTargets(board, from, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], color);
    case 'knight':
      return jumpTargets(board, from, [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]], color);
    case 'king':
      return jumpTargets(board, from, [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], color);
    case 'pawn':
      return pawnTargets(board, from, color);
    default:
      return [];
  }
}

export function isValidMove(state: BotGameState, move: Move, color: Color): boolean {
  const { board, serverTime } = state;
  const piece = board[move.from.row]?.[move.from.col];
  if (!piece || piece.color !== color) return false;
  if (piece.cooldownUntil > serverTime) return false;
  const targets = legalTargets(board, move.from, color);
  return targets.some(sq => sq.row === move.to.row && sq.col === move.to.col);
}

/** All legal moves for the piece at `square`. Returns [] if empty, wrong color, or on cooldown. */
export function computePossibleMoves(state: BotGameState, square: Square): Move[] {
  const { board, serverTime } = state;
  const piece = board[square.row]?.[square.col];
  if (!piece || piece.color !== state.myColor) return [];
  if (piece.cooldownUntil > serverTime) return [];
  return legalTargets(board, square, state.myColor).map(to => ({ from: square, to }));
}
