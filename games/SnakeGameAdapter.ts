import { BaseGameAdapter, GameConfig, GameState, GameStats } from '../core/GameAdapter';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type Cell = { x: number; y: number };

export class SnakeGameAdapter extends BaseGameAdapter {
  private width = 20;
  private height = 20;
  private snake: Cell[] = [];
  private food: Cell = { x: 10, y: 10 };
  private direction: Direction = 'RIGHT';
  private nextDirection: Direction = 'RIGHT';
  private tickMs = 120;
  private startedAt = 0;
  private intervalId: number | null = null;

  async init(config: GameConfig): Promise<void> {
    await super.init(config);

    const speedByDifficulty: Record<GameConfig['difficulty'], number> = {
      EASY: 160,
      MEDIUM: 120,
      HARD: 90,
      EXPERT: 70
    };

    this.tickMs = speedByDifficulty[config.difficulty];
    this.reset();
    this.setState(GameState.READY);
  }

  private reset(): void {
    this.score = 0;
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.snake = [{ x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 }];
    this.spawnFood();
    this.startedAt = 0;
  }

  start(): void {
    if (this.state !== GameState.READY) return;
    this.startedAt = Date.now();
    this.setState(GameState.PLAYING);
    this.startLoop();
  }

  pause(): void {
    if (this.state !== GameState.PLAYING) return;
    this.stopLoop();
    this.setState(GameState.PAUSED);
  }

  resume(): void {
    if (this.state !== GameState.PAUSED) return;
    this.setState(GameState.PLAYING);
    this.startLoop();
  }

  end(): void {
    if (this.state === GameState.FINISHED || this.state === GameState.EXIT) return;
    this.stopLoop();
    this.setState(GameState.FINISHED);
    this.emit('gameOver', this.getStats());
  }

  destroy(): void {
    this.stopLoop();
    this.setState(GameState.EXIT);
  }

  private startLoop(): void {
    if (this.intervalId !== null) return;
    this.intervalId = window.setInterval(() => this.tick(), this.tickMs);
  }

  private stopLoop(): void {
    if (this.intervalId === null) return;
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  setDirection(direction: Direction): void {
    const opposite: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    if (opposite[this.direction] === direction) return;
    this.nextDirection = direction;
  }

  getGridSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  getSnake(): Cell[] {
    return this.snake;
  }

  getFood(): Cell {
    return this.food;
  }

  private tick(): void {
    if (this.state !== GameState.PLAYING) return;

    this.direction = this.nextDirection;
    const head = this.snake[this.snake.length - 1];
    const next = { x: head.x, y: head.y };

    if (this.direction === 'UP') next.y -= 1;
    if (this.direction === 'DOWN') next.y += 1;
    if (this.direction === 'LEFT') next.x -= 1;
    if (this.direction === 'RIGHT') next.x += 1;

    if (next.x < 0 || next.y < 0 || next.x >= this.width || next.y >= this.height) {
      this.end();
      return;
    }

    if (this.snake.some(c => c.x === next.x && c.y === next.y)) {
      this.end();
      return;
    }

    this.snake.push(next);

    if (next.x === this.food.x && next.y === this.food.y) {
      this.updateScore(10);
      this.spawnFood();
      return;
    }

    this.snake.shift();
  }

  private spawnFood(): void {
    const occupied = new Set(this.snake.map(c => `${c.x}:${c.y}`));
    const free: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!occupied.has(`${x}:${y}`)) free.push({ x, y });
      }
    }

    if (free.length === 0) {
      this.end();
      return;
    }

    this.food = free[Math.floor(Math.random() * free.length)];
  }

  getStats(): GameStats {
    const timeElapsed = this.startedAt ? (Date.now() - this.startedAt) / 1000 : 0;
    return {
      score: this.score,
      timeElapsed,
      length: this.snake.length
    };
  }

  saveState(): any {
    return {
      width: this.width,
      height: this.height,
      snake: this.snake,
      food: this.food,
      score: this.score,
      direction: this.direction,
      nextDirection: this.nextDirection,
      startedAt: this.startedAt,
      tickMs: this.tickMs,
      state: this.state
    };
  }

  loadState(state: any): void {
    this.width = state.width ?? this.width;
    this.height = state.height ?? this.height;
    this.snake = state.snake ?? this.snake;
    this.food = state.food ?? this.food;
    this.score = state.score ?? this.score;
    this.direction = state.direction ?? this.direction;
    this.nextDirection = state.nextDirection ?? this.nextDirection;
    this.startedAt = state.startedAt ?? this.startedAt;
    this.tickMs = state.tickMs ?? this.tickMs;
    if (state.state) {
      this.state = state.state;
    }
  }
}
