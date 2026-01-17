// ==========================================
// ECONOMY & TOKEN SYSTEM
// ==========================================

export enum TokenType {
    SOFT = 'SOFT',   // Free currency (earned through gameplay)
    HARD = 'HARD'    // Premium currency (purchased)
}

export enum MovementType {
    PURCHASE = 'PURCHASE',
    REWARD = 'REWARD',
    REFUND = 'REFUND',
    ADMIN_ADJUST = 'ADMIN_ADJUST',
    DAILY_BONUS = 'DAILY_BONUS',
    ACHIEVEMENT = 'ACHIEVEMENT',
    REFERRAL = 'REFERRAL'
}

export interface Wallet {
    userId: string;
    softTokens: number;
    hardTokens: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletMovement {
    id: string;
    walletId: string;
    type: MovementType;
    tokenType: TokenType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reference?: string;  // Game ID, Purchase ID, etc.
    metadata?: Record<string, any>;
    createdAt: Date;
}

export interface RewardCalculation {
    baseScore: number;
    difficulty: number;
    streakMultiplier: number;
    eventMultiplier: number;
    finalReward: number;
}

// ==========================================
// ECONOMY ENGINE
// ==========================================
export class EconomyEngine {
    private wallets: Map<string, Wallet> = new Map();
    private movements: WalletMovement[] = [];

    // RULE: Never modify wallet directly, always use addMovement
    private addMovement(
        walletId: string,
        type: MovementType,
        tokenType: TokenType,
        amount: number,
        reference?: string,
        metadata?: Record<string, any>
    ): WalletMovement {
        const wallet = this.wallets.get(walletId);
        if (!wallet) throw new Error('Wallet not found');

        const balanceBefore = tokenType === TokenType.SOFT ? wallet.softTokens : wallet.hardTokens;
        const balanceAfter = balanceBefore + amount;

        // Update wallet
        if (tokenType === TokenType.SOFT) {
            wallet.softTokens = balanceAfter;
        } else {
            wallet.hardTokens = balanceAfter;
        }
        wallet.updatedAt = new Date();

        // Create movement record
        const movement: WalletMovement = {
            id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            walletId,
            type,
            tokenType,
            amount,
            balanceBefore,
            balanceAfter,
            reference,
            metadata,
            createdAt: new Date()
        };

        this.movements.push(movement);
        return movement;
    }

    createWallet(userId: string, initialSoftTokens: number = 1000, initialHardTokens: number = 0): Wallet {
        const wallet: Wallet = {
            userId,
            softTokens: initialSoftTokens,
            hardTokens: initialHardTokens,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.wallets.set(userId, wallet);

        if (initialSoftTokens !== 0) {
            this.addMovement(userId, MovementType.ADMIN_ADJUST, TokenType.SOFT, initialSoftTokens, 'initial_soft_tokens');
        }

        if (initialHardTokens !== 0) {
            this.addMovement(userId, MovementType.ADMIN_ADJUST, TokenType.HARD, initialHardTokens, 'initial_hard_tokens');
        }

        return wallet;
    }

    getWallet(userId: string): Wallet | undefined {
        return this.wallets.get(userId);
    }

    restoreWallet(userId: string, softTokens: number, hardTokens: number): Wallet {
        const existing = this.wallets.get(userId);

        if (!existing) {
            const wallet: Wallet = {
                userId,
                softTokens,
                hardTokens,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.wallets.set(userId, wallet);
            return wallet;
        }

        existing.softTokens = softTokens;
        existing.hardTokens = hardTokens;
        existing.updatedAt = new Date();
        return existing;
    }

    // Calculate reward based on performance
    calculateReward(
        score: number,
        difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT',
        streak: number = 1,
        eventMultiplier: number = 1.0
    ): RewardCalculation {
        const difficultyMap = {
            EASY: 1.0,
            MEDIUM: 1.5,
            HARD: 2.0,
            EXPERT: 3.0
        };

        const difficultyBonus = difficultyMap[difficulty];
        const streakBonus = Math.min(1 + (streak * 0.1), 3.0); // Max 3x from streak

        const finalReward = Math.floor(
            score * difficultyBonus * streakBonus * eventMultiplier
        );

        return {
            baseScore: score,
            difficulty: difficultyBonus,
            streakMultiplier: streakBonus,
            eventMultiplier,
            finalReward
        };
    }

    // Award tokens to user
    rewardUser(
        userId: string,
        amount: number,
        type: MovementType = MovementType.REWARD,
        reference?: string
    ): WalletMovement {
        return this.addMovement(userId, type, TokenType.SOFT, amount, reference);
    }

    // Deduct tokens (for purchases)
    deductTokens(
        userId: string,
        amount: number,
        tokenType: TokenType,
        reference: string
    ): WalletMovement {
        const wallet = this.wallets.get(userId);
        if (!wallet) throw new Error('Wallet not found');

        const balance = tokenType === TokenType.SOFT ? wallet.softTokens : wallet.hardTokens;
        if (balance < amount) {
            throw new Error('Insufficient tokens');
        }

        return this.addMovement(userId, MovementType.PURCHASE, tokenType, -amount, reference);
    }

    // Add hard tokens (from real money purchase)
    addHardTokens(userId: string, amount: number, transactionId: string): WalletMovement {
        return this.addMovement(
            userId,
            MovementType.PURCHASE,
            TokenType.HARD,
            amount,
            transactionId
        );
    }

    // Get movement history
    getMovements(userId: string, limit: number = 50): WalletMovement[] {
        return this.movements
            .filter(m => m.walletId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    // Exchange hard tokens for soft tokens
    exchangeTokens(userId: string, hardTokenAmount: number, rate: number = 100): WalletMovement[] {
        const softTokenAmount = hardTokenAmount * rate;

        const deduction = this.deductTokens(userId, hardTokenAmount, TokenType.HARD, 'token_exchange');
        const addition = this.addMovement(
            userId,
            MovementType.REWARD,
            TokenType.SOFT,
            softTokenAmount,
            'token_exchange'
        );

        return [deduction, addition];
    }
}
