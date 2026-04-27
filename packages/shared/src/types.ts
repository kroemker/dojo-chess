// Coordinates: board[row][col], row 0 = rank 8 (black back rank), col 0 = file a
// board[0][0] = a8 (black rook), board[7][4] = e1 (white king starting square)

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type Color = 'white' | 'black';
export type GamePhase = 'waiting' | 'playing' | 'finished';

export interface Piece {
  type: PieceType;
  color: Color;
  /** Unix ms timestamp; 0 = available immediately */
  cooldownUntil: number;
  /** Stable identity for tracking across moves, e.g. "white-king" */
  id: string;
}

export interface Square {
  row: number; // 0–7
  col: number; // 0–7
}

export interface Move {
  from: Square;
  to: Square;
}

export type Board = (Piece | null)[][];

export interface GameState {
  gameId: string;
  board: Board;
  phase: GamePhase;
  winner: Color | null;
  /** Date.now() when this snapshot was produced — use for cooldown math on client */
  serverTime: number;
  moveCount: number;
}

/** Minimal view passed to bot functions — no meta-game info needed */
export interface BotGameState {
  board: Board;
  myColor: Color;
  serverTime: number;
}

export interface BotRecord {
  id: number;
  userId: string | null;
  name: string;
  code: string;
  createdAt: string;
}

export interface GameRecord {
  id: string;
  whiteBotId: number;
  blackBotId: number;
  phase: GamePhase;
  winner: Color | null;
}

export type ServerMessage =
  | { type: 'state'; payload: GameState }
  | { type: 'error'; payload: string };
