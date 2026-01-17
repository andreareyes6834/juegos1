// ==========================================
// GAMIFICATION ENGINE
// ==========================================

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    tokenReward: number;
    requirement: {
        type: 'score' | 'games_played' | 'streak' | 'level' | 'custom';
        value: number;
    };
    unlocked: boolean;
    unlockedAt?: Date;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'special';
    reward: {
        xp: number;
        softTokens: number;
        hardTokens?: number;
    };
    requirement: {
        type: 'play_games' | 'earn_score' | 'win_streak' | 'spend_tokens';
        target: number;
        current: number;
    };
    expiresAt: Date;
    completed: boolean;
}

export interface UserProgress {
    userId: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    totalGamesPlayed: number;
    totalScore: number;
    currentStreak: number;
    longestStreak: number;
    achievements: Achievement[];
    missions: Mission[];
    lastLoginAt: Date;
    dailyRewardClaimed: boolean;
    dailyRewardStreak: number;
}

// ==========================================
// GAMIFICATION ENGINE
// ==========================================
export class GamificationEngine {
    private userProgress: Map<string, UserProgress> = new Map();

    // XP curve formula: xp_needed = base * (level ^ exponent)
    private calculateXPForLevel(level: number): number {
        const base = 1000;
        const exponent = 1.5;
        return Math.floor(base * Math.pow(level, exponent));
    }

    createUserProgress(userId: string): UserProgress {
        const progress: UserProgress = {
            userId,
            level: 1,
            xp: 0,
            xpToNextLevel: this.calculateXPForLevel(1),
            totalGamesPlayed: 0,
            totalScore: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: this.generateDefaultAchievements(),
            missions: [],
            lastLoginAt: new Date(),
            dailyRewardClaimed: false,
            dailyRewardStreak: 0
        };

        this.userProgress.set(userId, progress);
        this.generateDailyMissions(userId);

        return progress;
    }

    getProgress(userId: string): UserProgress | undefined {
        return this.userProgress.get(userId);
    }

    restoreProgress(
        userId: string,
        data: Partial<Pick<
            UserProgress,
            'level' | 'xp' | 'xpToNextLevel' | 'totalGamesPlayed' | 'totalScore' | 'currentStreak' | 'longestStreak' | 'dailyRewardClaimed' | 'dailyRewardStreak'
        >>
    ): UserProgress {
        const progress = this.userProgress.get(userId) ?? this.createUserProgress(userId);

        if (typeof data.level === 'number') progress.level = data.level;
        if (typeof data.xp === 'number') progress.xp = data.xp;
        if (typeof data.xpToNextLevel === 'number') progress.xpToNextLevel = data.xpToNextLevel;
        if (typeof data.totalGamesPlayed === 'number') progress.totalGamesPlayed = data.totalGamesPlayed;
        if (typeof data.totalScore === 'number') progress.totalScore = data.totalScore;
        if (typeof data.currentStreak === 'number') progress.currentStreak = data.currentStreak;
        if (typeof data.longestStreak === 'number') progress.longestStreak = data.longestStreak;
        if (typeof data.dailyRewardClaimed === 'boolean') progress.dailyRewardClaimed = data.dailyRewardClaimed;
        if (typeof data.dailyRewardStreak === 'number') progress.dailyRewardStreak = data.dailyRewardStreak;

        return progress;
    }

    // Award XP and handle level ups
    awardXP(userId: string, amount: number): { levelsGained: number; newLevel: number } {
        const progress = this.userProgress.get(userId);
        if (!progress) throw new Error('User progress not found');

        progress.xp += amount;
        let levelsGained = 0;

        // Check for level ups
        while (progress.xp >= progress.xpToNextLevel) {
            progress.xp -= progress.xpToNextLevel;
            progress.level++;
            levelsGained++;
            progress.xpToNextLevel = this.calculateXPForLevel(progress.level);
        }

        return { levelsGained, newLevel: progress.level };
    }

    // Record game completion
    recordGamePlayed(
        userId: string,
        score: number,
        won: boolean,
        xpEarned: number = 0
    ): { unlockedAchievements: Achievement[]; completedMissions: Mission[] } {
        const progress = this.userProgress.get(userId);
        if (!progress) throw new Error('User progress not found');

        progress.totalGamesPlayed++;
        progress.totalScore += score;

        // Update streak
        if (won) {
            progress.currentStreak++;
            if (progress.currentStreak > progress.longestStreak) {
                progress.longestStreak = progress.currentStreak;
            }
        } else {
            progress.currentStreak = 0;
        }

        if (xpEarned > 0) {
            this.awardXP(userId, xpEarned);
        }

        // Check achievements
        const unlockedAchievements = this.checkAchievements(userId);

        // Update missions
        const completedMissions: Mission[] = [];
        completedMissions.push(...this.updateMissions(userId, 'play_games', 1));
        completedMissions.push(...this.updateMissions(userId, 'earn_score', score));
        if (won) {
            completedMissions.push(...this.updateMissions(userId, 'win_streak', 1));
        }

        const uniqueMissions = new Map(completedMissions.map(m => [m.id, m]));

        return { unlockedAchievements, completedMissions: Array.from(uniqueMissions.values()) };
    }

    // Check and unlock achievements
    private checkAchievements(userId: string): Achievement[] {
        const progress = this.userProgress.get(userId);
        if (!progress) return [];

        const unlockedAchievements: Achievement[] = [];

        for (const achievement of progress.achievements) {
            if (achievement.unlocked) continue;

            let shouldUnlock = false;

            switch (achievement.requirement.type) {
                case 'games_played':
                    shouldUnlock = progress.totalGamesPlayed >= achievement.requirement.value;
                    break;
                case 'score':
                    shouldUnlock = progress.totalScore >= achievement.requirement.value;
                    break;
                case 'streak':
                    shouldUnlock = progress.longestStreak >= achievement.requirement.value;
                    break;
                case 'level':
                    shouldUnlock = progress.level >= achievement.requirement.value;
                    break;
            }

            if (shouldUnlock) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date();
                unlockedAchievements.push(achievement);

                // Award XP and tokens
                this.awardXP(userId, achievement.xpReward);
            }
        }

        return unlockedAchievements;
    }

    // Generate default achievements
    private generateDefaultAchievements(): Achievement[] {
        return [
            {
                id: 'first_game',
                title: 'First Steps',
                description: 'Play your first game',
                icon: '🎮',
                xpReward: 100,
                tokenReward: 50,
                requirement: { type: 'games_played', value: 1 },
                unlocked: false
            },
            {
                id: 'veteran',
                title: 'Veteran Player',
                description: 'Play 100 games',
                icon: '🏆',
                xpReward: 1000,
                tokenReward: 500,
                requirement: { type: 'games_played', value: 100 },
                unlocked: false
            },
            {
                id: 'score_master',
                title: 'Score Master',
                description: 'Earn 1,000,000 total score',
                icon: '⭐',
                xpReward: 2000,
                tokenReward: 1000,
                requirement: { type: 'score', value: 1000000 },
                unlocked: false
            },
            {
                id: 'streak_10',
                title: 'Winning Streak',
                description: 'Win 10 games in a row',
                icon: '🔥',
                xpReward: 1500,
                tokenReward: 750,
                requirement: { type: 'streak', value: 10 },
                unlocked: false
            },
            {
                id: 'level_10',
                title: 'Expert',
                description: 'Reach level 10',
                icon: '👑',
                xpReward: 500,
                tokenReward: 250,
                requirement: { type: 'level', value: 10 },
                unlocked: false
            }
        ];
    }

    // Daily missions
    private generateDailyMissions(userId: string): void {
        const progress = this.userProgress.get(userId);
        if (!progress) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        progress.missions = [
            {
                id: 'daily_play_3',
                title: 'Daily Player',
                description: 'Play 3 games today',
                type: 'daily',
                reward: { xp: 200, softTokens: 100 },
                requirement: { type: 'play_games', target: 3, current: 0 },
                expiresAt: tomorrow,
                completed: false
            },
            {
                id: 'daily_score',
                title: 'Score Hunter',
                description: 'Earn 10,000 points today',
                type: 'daily',
                reward: { xp: 300, softTokens: 150 },
                requirement: { type: 'earn_score', target: 10000, current: 0 },
                expiresAt: tomorrow,
                completed: false
            }
        ];
    }

    private updateMissions(userId: string, type: string, progress: number): Mission[] {
        const userProgress = this.userProgress.get(userId);
        if (!userProgress) return [];

        const completed: Mission[] = [];

        for (const mission of userProgress.missions) {
            if (mission.completed) continue;
            if (mission.requirement.type !== type) continue;

            mission.requirement.current += progress;

            if (mission.requirement.current >= mission.requirement.target) {
                mission.completed = true;
                this.awardXP(userId, mission.reward.xp);
                completed.push(mission);
            }
        }

        return completed;
    }

    // Daily rewards
    claimDailyReward(userId: string): { xp: number; softTokens: number; streak: number } | null {
        const progress = this.userProgress.get(userId);
        if (!progress) return null;

        if (progress.dailyRewardClaimed) return null;

        progress.dailyRewardClaimed = true;
        progress.dailyRewardStreak++;

        const baseXP = 100;
        const baseTokens = 50;
        const streakBonus = Math.min(progress.dailyRewardStreak, 7); // Max 7 day streak

        const reward = {
            xp: baseXP * streakBonus,
            softTokens: baseTokens * streakBonus,
            streak: progress.dailyRewardStreak
        };

        this.awardXP(userId, reward.xp);

        return reward;
    }
}
