import { BaseGameAdapter, GameConfig, GameState, GameStats } from '../core/GameAdapter';

type Player = 'X' | 'O';

type Cell = Player | null;

type Board = Cell[][];

export class TicTacToeAdapter extends BaseGameAdapter {
  private board: Board = [];
  private current: Player = 'X';
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
    this.current = 'X';
    this.winner = null;
    this.moves = 0;
    this.board = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null));
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

  play(x: number, y: number): boolean {
    if (this.state !== GameState.PLAYING) return false;
    if (this.winner) return false;
    if (this.board[y][x]) return false;

    this.board[y][x] = this.current;
    this.moves++;

    const win = this.checkWinner();
    if (win) {
      this.winner = win;
      if (win === 'X') {
        this.updateScore(100);
      } else if (win === 'O') {
        this.updateScore(60);
      } else {
        this.updateScore(40);
      }
      this.end();
      return true;
    }

    this.current = this.current === 'X' ? 'O' : 'X';
    return true;
  }

  private checkWinner(): Player | 'DRAW' | null {
    const lines: Cell[][] = [];

    for (let y = 0; y < 3; y++) lines.push([this.board[y][0], this.board[y][1], this.board[y][2]]);
    for (let x = 0; x < 3; x++) lines.push([this.board[0][x], this.board[1][x], this.board[2][x]]);

    lines.push([this.board[0][0], this.board[1][1], this.board[2][2]]);
    lines.push([this.board[0][2], this.board[1][1], this.board[2][0]]);

    for (const l of lines) {
      if (l[0] && l[0] === l[1] && l[1] === l[2]) return l[0];
    }

    if (this.moves >= 9) return 'DRAW';
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
