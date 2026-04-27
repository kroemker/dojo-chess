import type { Board, Piece, PieceType, Color, Square } from '@dojo-chess/shared';
import { BOARD_SIZE } from './constants.js';

type BackRankLayout = [PieceType, PieceType, PieceType, PieceType, PieceType, PieceType, PieceType, PieceType];

const BACK_RANK: BackRankLayout = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

function makePiece(type: PieceType, color: Color, col: number, rank: number): Piece {
  return { type, color, cooldownUntil: 0, id: `${color}-${type}-${col}-${rank}` };
}

export function initBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

  // Black back rank — row 0
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[0][col] = makePiece(BACK_RANK[col], 'black', col, 0);
  }
  // Black pawns — row 1
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[1][col] = makePiece('pawn', 'black', col, 1);
  }
  // White pawns — row 6
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[6][col] = makePiece('pawn', 'white', col, 6);
  }
  // White back rank — row 7
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[7][col] = makePiece(BACK_RANK[col], 'white', col, 7);
  }

  return board;
}

export function squareToAlgebraic(sq: Square): string {
  return String.fromCharCode('a'.charCodeAt(0) + sq.col) + String(8 - sq.row);
}

export function algebraicToSquare(s: string): Square {
  return { col: s.charCodeAt(0) - 'a'.charCodeAt(0), row: 8 - parseInt(s[1], 10) };
}
