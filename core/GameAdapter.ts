// ==========================================
// GAME ADAPTER INTERFACE
// ==========================================
// This is the MANDATORY contract that ALL games must implement
// to integrate with the platform

export enum GameState {
  INIT = 'INIT',
  LOADING = 'LOADING',
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  REWARD = 'REWARD',
  EXIT = 'EXIT'
}

export interface GameStats {
  score: number;
  timeElapsed: number;
  moves?: number;
  accuracy?: number;
  combo?: number;
  [key: string]: any;
}

export interface GameConfig {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  soundEnabled: boolean;
  musicEnabled: boolean;
  fps: number;
}

export interface GameAdapter {
  // Lifecycle methods
  init(config: GameConfig): Promise<void>;
  start(): void;
  pause(): void;
  resume(): void;
  end(): void;
  destroy(): void;

  // State getters
  getState(): GameState;
  getScore(): number;
  getStats(): GameStats;
  
  // Save/Load
  saveState(): any;
  loadState(state: any): void;

  // Events - subscribe to game events
  on(event: 'stateChange' | 'scoreUpdate' | 'gameOver', callback: (data?: any) => void): void;
  off(event: 'stateChange' | 'scoreUpdate' | 'gameOver', callback: (data?: any) => void): void;
}

export abstract class BaseGameAdapter implements GameAdapter {
  protected state: GameState = GameState.INIT;
  protected score: number = 0;
  protected config!: GameConfig;
  protected eventListeners: Map<string, Set<Function>> = new Map();

  async init(config: GameConfig): Promise<void> {
    this.config = config;
    this.state = GameState.LOADING;
    this.emit('stateChange', this.state);
  }

  abstract start(): void;
  abstract pause(): void;
  abstract resume(): void;
  abstract end(): void;
  abstract destroy(): void;
  abstract getStats(): GameStats;
  abstract saveState(): any;
  abstract loadState(state: any): void;

  getState(): GameState {
    return this.state;
  }

  getScore(): number {
    return this.score;
  }

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  protected emit(event: string, data?: any): void {
    this.eventListeners.get(event)?.forEach(cb => cb(data));
  }

  protected setState(newState: GameState): void {
    this.state = newState;
    this.emit('stateChange', newState);
  }

  protected updateScore(points: number): void {
    this.score += points;
    this.emit('scoreUpdate', this.score);
  }
}
