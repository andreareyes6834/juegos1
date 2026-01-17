import { BaseGameAdapter, GameConfig, GameState, GameStats } from '../core/GameAdapter';

type Vec2 = { x: number; y: number };

type Input = { up: boolean; down: boolean };

export class PongGameAdapter extends BaseGameAdapter {
  private width = 640;
  private height = 360;

  private paddleW = 12;
  private paddleH = 80;

  private playerY = 140;
  private aiY = 140;
  private ball: Vec2 = { x: 320, y: 180 };
  private ballVel: Vec2 = { x: 220, y: 140 };

  private input: Input = { up: false, down: false };
  private startedAt = 0;
  private intervalId: number | null = null;
  private tickMs = 16;
  private rallies = 0;

  async init(config: GameConfig): Promise<void> {
    await super.init(config);

    const tickByDifficulty: Record<GameConfig['difficulty'], number> = {
      EASY: 18,
      MEDIUM: 16,
      HARD: 14,
      EXPERT: 12
    };

    this.tickMs = tickByDifficulty[config.difficulty];
    this.reset();
    this.setState(GameState.READY);
  }

  private reset(): void {
    this.score = 0;
    this.rallies = 0;
    this.playerY = (this.height - this.paddleH) / 2;
    this.aiY = (this.height - this.paddleH) / 2;
    this.ball = { x: this.width / 2, y: this.height / 2 };
    const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
    const speed = 260;
    const dir = Math.random() > 0.5 ? 1 : -1;
    this.ballVel = { x: Math.cos(angle) * speed * dir, y: Math.sin(angle) * speed };
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
    const last = { t: performance.now() };
    this.intervalId = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last.t) / 1000);
      last.t = now;
      this.tick(dt);
    }, this.tickMs);
  }

  private stopLoop(): void {
    if (this.intervalId === null) return;
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }

  setInput(input: Partial<Input>): void {
    this.input = { ...this.input, ...input };
  }

  getField(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  getPaddles(): { playerY: number; aiY: number; paddleW: number; paddleH: number } {
    return { playerY: this.playerY, aiY: this.aiY, paddleW: this.paddleW, paddleH: this.paddleH };
  }

  getBall(): { x: number; y: number } {
    return { x: this.ball.x, y: this.ball.y };
  }

  private tick(dt: number): void {
    if (this.state !== GameState.PLAYING) return;

    const paddleSpeed = 260;

    if (this.input.up) this.playerY -= paddleSpeed * dt;
    if (this.input.down) this.playerY += paddleSpeed * dt;
    this.playerY = Math.max(0, Math.min(this.height - this.paddleH, this.playerY));

    const aiSpeed = 220;
    const target = this.ball.y - this.paddleH / 2;
    const delta = target - this.aiY;
    this.aiY += Math.max(-aiSpeed * dt, Math.min(aiSpeed * dt, delta));
    this.aiY = Math.max(0, Math.min(this.height - this.paddleH, this.aiY));

    this.ball.x += this.ballVel.x * dt;
    this.ball.y += this.ballVel.y * dt;

    if (this.ball.y < 0) {
      this.ball.y = 0;
      this.ballVel.y *= -1;
    }

    if (this.ball.y > this.height) {
      this.ball.y = this.height;
      this.ballVel.y *= -1;
    }

    const leftX = 24;
    const rightX = this.width - 24 - this.paddleW;

    if (this.ball.x <= leftX + this.paddleW && this.ball.x >= leftX) {
      if (this.ball.y >= this.playerY && this.ball.y <= this.playerY + this.paddleH) {
        this.ball.x = leftX + this.paddleW;
        this.ballVel.x = Math.abs(this.ballVel.x) * 1.03;
        this.ballVel.y = (this.ball.y - (this.playerY + this.paddleH / 2)) * 6;
        this.rallies++;
        this.updateScore(1);
      }
    }

    if (this.ball.x >= rightX && this.ball.x <= rightX + this.paddleW) {
      if (this.ball.y >= this.aiY && this.ball.y <= this.aiY + this.paddleH) {
        this.ball.x = rightX;
        this.ballVel.x = -Math.abs(this.ballVel.x) * 1.02;
        this.ballVel.y = (this.ball.y - (this.aiY + this.paddleH / 2)) * 6;
      }
    }

    if (this.ball.x < 0) {
      this.end();
      return;
    }

    if (this.ball.x > this.width) {
      this.reset();
      this.setState(GameState.READY);
      this.emit('stateChange', this.state);
    }
  }

  getStats(): GameStats {
    const timeElapsed = this.startedAt ? (Date.now() - this.startedAt) / 1000 : 0;
    return {
      score: this.score,
      timeElapsed,
      rallies: this.rallies
    };
  }

  saveState(): any {
    return {
      score: this.score,
      startedAt: this.startedAt,
      playerY: this.playerY,
      aiY: this.aiY,
      ball: this.ball,
      ballVel: this.ballVel,
      rallies: this.rallies,
      state: this.state,
      tickMs: this.tickMs
    };
  }

  loadState(state: any): void {
    this.score = state.score ?? this.score;
    this.startedAt = state.startedAt ?? this.startedAt;
    this.playerY = state.playerY ?? this.playerY;
    this.aiY = state.aiY ?? this.aiY;
    this.ball = state.ball ?? this.ball;
    this.ballVel = state.ballVel ?? this.ballVel;
    this.rallies = state.rallies ?? this.rallies;
    this.tickMs = state.tickMs ?? this.tickMs;
    if (state.state) {
      this.state = state.state;
    }
  }
}
