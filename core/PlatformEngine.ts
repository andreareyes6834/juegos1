import { EconomyEngine, MovementType, TokenType } from './EconomyEngine';
import { GamificationEngine, Mission, Achievement, UserProgress } from './GamificationEngine';
import type { PlatformUserState } from './PlatformPersistence';

export interface PlatformUserSeed {
  coins?: number;
  gems?: number;
  level?: number;
  xp?: number;
  maxXp?: number;
}

export interface GameFinishInput {
  gameId: string;
  score: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  won: boolean;
}

export interface GameFinishOutput {
  baseReward: number;
  bonusFromAchievements: number;
  bonusFromMissions: number;
  totalCoinsAwarded: number;
  unlockedAchievements: Achievement[];
  completedMissions: Mission[];
  progress: UserProgress;
}

export class PlatformEngine {
  private economy = new EconomyEngine();
  private gamification = new GamificationEngine();

  initUser(userId: string, seed?: PlatformUserSeed): void {
    const existingWallet = this.economy.getWallet(userId);
    if (!existingWallet) {
      this.economy.createWallet(userId, seed?.coins ?? 0, seed?.gems ?? 0);
    }

    const existingProgress = this.gamification.getProgress(userId);
    if (!existingProgress) {
      this.gamification.createUserProgress(userId);
    }

    const progress = this.gamification.getProgress(userId);
    if (progress && seed) {
      if (typeof seed.level === 'number') {
        progress.level = seed.level;
      }
      if (typeof seed.xp === 'number') {
        progress.xp = seed.xp;
      }
      if (typeof seed.maxXp === 'number') {
        progress.xpToNextLevel = seed.maxXp;
      }
    }
  }

  getCoins(userId: string): number {
    return this.economy.getWallet(userId)?.softTokens ?? 0;
  }

  getGems(userId: string): number {
    return this.economy.getWallet(userId)?.hardTokens ?? 0;
  }

  getProgress(userId: string): UserProgress {
    const progress = this.gamification.getProgress(userId);
    if (!progress) throw new Error('User progress not found');
    return progress;
  }

  exportUserState(userId: string): PlatformUserState {
    const wallet = this.economy.getWallet(userId);
    const progress = this.gamification.getProgress(userId);
    if (!wallet || !progress) throw new Error('User not initialized');

    return {
      wallet: {
        softTokens: wallet.softTokens,
        hardTokens: wallet.hardTokens
      },
      progress: {
        level: progress.level,
        xp: progress.xp,
        xpToNextLevel: progress.xpToNextLevel,
        totalGamesPlayed: progress.totalGamesPlayed,
        totalScore: progress.totalScore,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        dailyRewardClaimed: progress.dailyRewardClaimed,
        dailyRewardStreak: progress.dailyRewardStreak
      }
    };
  }

  importUserState(userId: string, state: PlatformUserState): void {
    this.economy.restoreWallet(userId, state.wallet.softTokens, state.wallet.hardTokens);
    this.gamification.restoreProgress(userId, state.progress);
  }

  startGame(userId: string, gameId: string, minBet: number): void {
    if (minBet <= 0) return;
    this.economy.deductTokens(userId, minBet, TokenType.SOFT, `entry:${gameId}`);
  }

  finishGame(userId: string, input: GameFinishInput): GameFinishOutput {
    const rewardCalc = this.economy.calculateReward(
      input.score,
      input.difficulty,
      this.getProgress(userId).currentStreak || 1,
      1.0
    );

    const baseReward = rewardCalc.finalReward;
    if (baseReward > 0) {
      this.economy.rewardUser(userId, baseReward, MovementType.REWARD, `game:${input.gameId}`);
    }

    const xpEarned = Math.max(50, Math.floor(input.score / 20));
    const { unlockedAchievements, completedMissions } = this.gamification.recordGamePlayed(
      userId,
      input.score,
      input.won,
      xpEarned
    );

    const bonusFromAchievements = unlockedAchievements.reduce((sum, a) => sum + (a.tokenReward || 0), 0);
    if (bonusFromAchievements > 0) {
      this.economy.rewardUser(userId, bonusFromAchievements, MovementType.ACHIEVEMENT, `achievements:${input.gameId}`);
    }

    const bonusFromMissions = completedMissions.reduce((sum, m) => sum + (m.reward?.softTokens || 0), 0);
    if (bonusFromMissions > 0) {
      this.economy.rewardUser(userId, bonusFromMissions, MovementType.REWARD, `missions:${input.gameId}`);
    }

    return {
      baseReward,
      bonusFromAchievements,
      bonusFromMissions,
      totalCoinsAwarded: baseReward + bonusFromAchievements + bonusFromMissions,
      unlockedAchievements,
      completedMissions,
      progress: this.getProgress(userId)
    };
  }
}

export const platformEngine = new PlatformEngine();
