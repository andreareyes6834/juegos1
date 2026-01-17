import { BaseGameAdapter, GameConfig, GameState, GameStats } from '../core/GameAdapter';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type Cell = number;

type Grid = Cell[][];

function cloneGrid(grid: Grid): Grid {
  return grid.map(row => row.slice());
}

function gridsEqual(a: Grid, b: Grid): boolean {
  for (let y = 0; y < a.length; y++) {
    for (let x = 0; x < a[y].length; x++) {
      if (a[y][x] !== b[y][x]) return false;
    }
  }
  return true;
}

export class Game2048Adapter extends BaseGameAdapter {
  private size = 4;
  private grid: Grid = [];
  private startedAt = 0;

  async init(config: GameConfig): Promise<void> {
    await super.init(config);
    this.reset();
    this.setState(GameState.READY);
  }

  private reset(): void {
    this.score = 0;
    this.startedAt = 0;
    this.grid = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => 0));
    this.spawn();
    this.spawn();
  }

  start(): void {
    if (this.state !== GameState.READY) return;
    this.startedAt = Date.now();
    this.setState(GameState.PLAYING);
  }

  pause(): void {
    if (this.state !== GameState.PLAYING) return;
    this.setState(GameState.PAUSED);
  }

  resume(): void {
    if (this.state !== GameState.PAUSED) return;
    this.setState(GameState.PLAYING);
  }

  end(): void {
    if (this.state === GameState.FINISHED || this.state === GameState.EXIT) return;
    this.setState(GameState.FINISHED);
    this.emit('gameOver', this.getStats());
  }

  destroy(): void {
    this.setState(GameState.EXIT);
  }

  getGrid(): Grid {
    return this.grid;
  }

  move(direction: Direction): boolean {
    if (this.state !== GameState.PLAYING) return false;

    const before = cloneGrid(this.grid);
    const merged = Array.from({ length: this.size }, () => Array.from({ length: this.size }, () => false));

    const range = (n: number) => Array.from({ length: n }, (_, i) => i);

    const xs = direction === 'RIGHT' ? range(this.size).reverse() : range(this.size);
    const ys = direction === 'DOWN' ? range(this.size).reverse() : range(this.size);

    const get = (x: number, y: number) => this.grid[y][x];
    const set = (x: number, y: number, v: number) => {
      this.grid[y][x] = v;
    };

    const step = (x: number, y: number): { x: number; y: number } => {
      if (direction === 'LEFT') return { x: x - 1, y };
      if (direction === 'RIGHT') return { x: x + 1, y };
      if (direction === 'UP') return { x, y: y - 1 };
      return { x, y: y + 1 };
    };

    const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < this.size && y < this.size;

    for (const y of ys) {
      for (const x of xs) {
        const value = get(x, y);
        if (!value) continue;

        let cx = x;
        let cy = y;

        while (true) {
          const n = step(cx, cy);
          if (!inBounds(n.x, n.y)) break;

          const nv = get(n.x, n.y);
          if (nv === 0) {
            set(n.x, n.y, get(cx, cy));
            set(cx, cy, 0);
            cx = n.x;
            cy = n.y;
            continue;
          }

          if (nv === get(cx, cy) && !merged[n.y][n.x]) {
            const newVal = nv * 2;
            set(n.x, n.y, newVal);
            set(cx, cy, 0);
            merged[n.y][n.x] = true;
            this.updateScore(newVal);
          }

          break;
        }
      }
    }

    if (!gridsEqual(before, this.grid)) {
      this.spawn();
      if (!this.hasMoves()) {
        this.end();
      }
      return true;
    }

    return false;
  }

  private spawn(): void {
    const empty: { x: number; y: number }[] = [];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.grid[y][x] === 0) empty.push({ x, y });
      }
    }
    if (empty.length === 0) return;
    const cell = empty[Math.floor(Math.random() * empty.length)];
    this.grid[cell.y][cell.x] = Math.random() < 0.9 ? 2 : 4;
  }

  private hasMoves(): boolean {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const v = this.grid[y][x];
        if (v === 0) return true;
        if (x + 1 < this.size && this.grid[y][x + 1] === v) return true;
        if (y + 1 < this.size && this.grid[y + 1][x] === v) return true;
      }
    }
    return false;
  }

  getStats(): GameStats {
    const timeElapsed = this.startedAt ? (Date.now() - this.startedAt) / 1000 : 0;
    const maxTile = Math.max(...this.grid.flat());
    return {
      score: this.score,
      timeElapsed,
      maxTile
    };
  }

  saveState(): any {
    return {
      score: this.score,
      startedAt: this.startedAt,
      grid: this.grid,
      state: this.state
    };
  }

  loadState(state: any): void {
    this.score = state.score ?? this.score;
    this.startedAt = state.startedAt ?? this.startedAt;
    this.grid = state.grid ?? this.grid;
    if (state.state) {
      this.state = state.state;
    }
  }
}
