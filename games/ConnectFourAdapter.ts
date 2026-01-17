import { BaseGameAdapter, GameConfig, GameState, GameStats } from '../core/GameAdapter';

type Player = 'R' | 'Y';

type Cell = Player | null;

type Board = Cell[][];

export class ConnectFourAdapter extends BaseGameAdapter {
  private cols = 7;
  private rows = 6;
  private board: Board = [];
  private current: Player = 'R';
  private startedAt = 0;
  private winner: Player | 'DRAW' | null = null;
  private moves = 0;

  async init(config: GameConfig): Promise<void> {
    await super.init(config);
    this.reset();
    this.setState(GameState.READY);
  }

  private reset(): void {
    this.score = 0;
    this.startedAt = 0;
    this.current = 'R';
    this.winner = null;
    this.moves = 0;
    this.board = Array.from({ length: this.rows }, () => Array.from({ length: this.cols }, () => null));
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

  getBoard(): Board {
    return this.board;
  }

  getCurrentPlayer(): Player {
    return this.current;
  }

  getWinner(): Player | 'DRAW' | null {
    return this.winner;
  }

  drop(col: number): boolean {
    if (this.state !== GameState.PLAYING) return false;
    if (this.winner) return false;
    if (col < 0 || col >= this.cols) return false;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][col]) {
        this.board[row][col] = this.current;
        this.moves++;

        const win = this.checkWinner(row, col);
        if (win) {
          this.winner = win;
          if (win === 'R') this.updateScore(140);
          if (win === 'Y') this.updateScore(110);
          if (win === 'DRAW') this.updateScore(60);
          this.end();
          return true;
        }

        this.current = this.current === 'R' ? 'Y' : 'R';
        return true;
      }
    }

    return false;
  }

  private checkWinner(lastRow: number, lastCol: number): Player | 'DRAW' | null {
    const player = this.board[lastRow][lastCol];
    if (!player) return null;

    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];

    const count = (dr: number, dc: number) => {
      let r = lastRow + dr;
      let c = lastCol + dc;
      let n = 0;
      while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
        n++;
        r += dr;
        c += dc;
      }
      return n;
    };

    for (const d of directions) {
      const total = 1 + count(d.dr, d.dc) + count(-d.dr, -d.dc);
      if (total >= 4) return player;
    }

    if (this.moves >= this.rows * this.cols) return 'DRAW';

    return null;
  }

  getStats(): GameStats {
    const timeElapsed = this.startedAt ? (Date.now() - this.startedAt) / 1000 : 0;
    return {
      score: this.score,
      timeElapsed,
      winner: this.winner,
      moves: this.moves
    };
  }

  saveState(): any {
    return {
      score: this.score,
      startedAt: this.startedAt,
      board: this.board,
      current: this.current,
      winner: this.winner,
      moves: this.moves,
      state: this.state
    };
  }

  loadState(state: any): void {
    this.score = state.score ?? this.score;
    this.startedAt = state.startedAt ?? this.startedAt;
    this.board = state.board ?? this.board;
    this.current = state.current ?? this.current;
    this.winner = state.winner ?? this.winner;
    this.moves = state.moves ?? this.moves;
    if (state.state) {
      this.state = state.state;
    }
  }
}
