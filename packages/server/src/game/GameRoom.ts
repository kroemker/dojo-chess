import { WebSocket } from 'ws';
import type { Color, GameState, ServerMessage } from '@dojo-chess/shared';
import { TICK_INTERVAL_MS } from '../chess/constants.js';
import { createInitialGameState, applyMove } from '../chess/engine.js';
import { isValidMove } from '../chess/moves.js';
import { runBot } from '../sandbox/runner.js';

function toBotState(state: GameState, color: Color) {
  return { board: state.board, myColor: color, serverTime: Date.now() };
}

export class GameRoom {
  readonly gameId: string;
  private state: GameState;
  private botCode: Record<Color, string>;
  private observers: Set<WebSocket> = new Set();
  private tickHandle: ReturnType<typeof setInterval> | null = null;

  constructor(gameId: string, whiteBotCode: string, blackBotCode: string) {
    this.gameId = gameId;
    this.botCode = { white: whiteBotCode, black: blackBotCode };
    this.state = createInitialGameState(gameId);
  }

  start(): void {
    this.state = { ...this.state, phase: 'playing' };
    this.tickHandle = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  getState(): GameState {
    return { ...this.state, serverTime: Date.now() };
  }

  addObserver(ws: WebSocket): void {
    this.observers.add(ws);
    ws.on('close', () => this.observers.delete(ws));
    // Send current state immediately on join
    this.send(ws, { type: 'state', payload: this.getState() });
  }

  private tick(): void {
    if (this.state.phase !== 'playing') {
      this.stop();
      return;
    }

    // Randomize execution order for fairness
    const order: Color[] = Math.random() < 0.5 ? ['white', 'black'] : ['black', 'white'];

    for (const color of order) {
      const botState = toBotState(this.state, color);
      const move = runBot(this.botCode[color], botState);
      if (move && isValidMove(botState, move, color)) {
        this.state = applyMove(this.state, move, color);
      }
    }

    this.broadcast({ type: 'state', payload: this.getState() });
  }

  private broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    for (const ws of this.observers) {
      if (ws.readyState === WebSocket.OPEN) ws.send(data);
    }
  }

  private send(ws: WebSocket, msg: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }

  private stop(): void {
    if (this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
    // Final state broadcast so observers see the finished state
    this.broadcast({ type: 'state', payload: this.getState() });
  }
}
