import { GameRoom } from './GameRoom.js';

class GameManager {
  private rooms = new Map<string, GameRoom>();

  createGame(gameId: string, whiteBotCode: string, blackBotCode: string): GameRoom {
    const room = new GameRoom(gameId, whiteBotCode, blackBotCode);
    this.rooms.set(gameId, room);
    return room;
  }

  getRoom(gameId: string): GameRoom | undefined {
    return this.rooms.get(gameId);
  }

  deleteRoom(gameId: string): void {
    this.rooms.delete(gameId);
  }
}

export const gameManager = new GameManager();
