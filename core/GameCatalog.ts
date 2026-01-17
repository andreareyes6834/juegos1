import type { GameAdapter } from './GameAdapter';
import { MemoryGameAdapter } from '../games/MemoryGameAdapter';
import { SnakeGameAdapter } from '../games/SnakeGameAdapter';
import { Game2048Adapter } from '../games/Game2048Adapter';
import { PongGameAdapter } from '../games/PongGameAdapter';
import { TicTacToeAdapter } from '../games/TicTacToeAdapter';
import { ConnectFourAdapter } from '../games/ConnectFourAdapter';

export type GameFactory = () => GameAdapter;

export class GameCatalog {
  private registry: Map<string, GameFactory> = new Map();

  constructor() {
    this.register('memory', () => new MemoryGameAdapter());
    this.register('snake', () => new SnakeGameAdapter());
    this.register('2048', () => new Game2048Adapter());
    this.register('pong', () => new PongGameAdapter());
    this.register('tictactoe', () => new TicTacToeAdapter());
    this.register('connect4', () => new ConnectFourAdapter());
  }

  register(gameId: string, factory: GameFactory): void {
    this.registry.set(gameId, factory);
  }

  has(gameId: string): boolean {
    return this.registry.has(gameId);
  }

  create(gameId: string): GameAdapter {
    const factory = this.registry.get(gameId);
    if (!factory) {
      throw new Error(`Game not registered: ${gameId}`);
    }
    return factory();
  }

  listGameIds(): string[] {
    return Array.from(this.registry.keys());
  }
}

export const gameCatalog = new GameCatalog();
