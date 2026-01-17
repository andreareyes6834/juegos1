// ==========================================
// DEMO GAME ADAPTER
// ==========================================
// Example implementation of a simple memory game

import { BaseGameAdapter, GameConfig, GameState, GameStats } from '../core/GameAdapter';

interface Card {
    id: number;
    value: string;
    revealed: boolean;
    matched: boolean;
}

export class MemoryGameAdapter extends BaseGameAdapter {
    private cards: Card[] = [];
    private revealedCards: number[] = [];
    private moves: number = 0;
    private matches: number = 0;
    private startTime: number = 0;
    private difficulty: number = 8; // Number of pairs

    async init(config: GameConfig): Promise<void> {
        await super.init(config);

        // Set difficulty
        const difficultyMap = { EASY: 6, MEDIUM: 8, HARD: 12, EXPERT: 16 };
        this.difficulty = difficultyMap[config.difficulty];

        // Initialize cards
        this.initializeCards();

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.setState(GameState.READY);
    }

    private initializeCards(): void {
        const values = ['🎮', '🎯', '🎲', '🎰', '🎪', '🎨', '🎬', '🎭', '🎺', '🎸', '🎹', '🎤', '🎧', '🎼', '🎵', '🎶'];
        const pairs = values.slice(0, this.difficulty);
        const cardValues = [...pairs, ...pairs];

        // Shuffle
        for (let i = cardValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
        }

        this.cards = cardValues.map((value, index) => ({
            id: index,
            value,
            revealed: false,
            matched: false
        }));
    }

    start(): void {
        if (this.state !== GameState.READY) return;

        this.setState(GameState.PLAYING);
        this.startTime = Date.now();
        this.moves = 0;
        this.matches = 0;
        this.updateScore(0);
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
        this.setState(GameState.FINISHED);
        this.emit('gameOver', this.getStats());
    }

    destroy(): void {
        this.cards = [];
        this.revealedCards = [];
        this.setState(GameState.EXIT);
    }

    // Handle card flip
    flipCard(cardId: number): void {
        if (this.state !== GameState.PLAYING) return;
        if (this.revealedCards.length >= 2) return;

        const card = this.cards[cardId];
        if (!card || card.revealed || card.matched) return;

        card.revealed = true;
        this.revealedCards.push(cardId);

        if (this.revealedCards.length === 2) {
            this.moves++;
            setTimeout(() => this.checkMatch(), 500);
        }
    }

    private checkMatch(): void {
        const [id1, id2] = this.revealedCards;
        const card1 = this.cards[id1];
        const card2 = this.cards[id2];

        if (card1.value === card2.value) {
            // Match!
            card1.matched = true;
            card2.matched = true;
            this.matches++;

            const points = Math.floor(1000 / this.moves);
            this.updateScore(points);

            // Check if game complete
            if (this.matches === this.difficulty) {
                this.end();
            }
        } else {
            // No match
            card1.revealed = false;
            card2.revealed = false;
        }

        this.revealedCards = [];
    }

    getStats(): GameStats {
        const timeElapsed = this.state === GameState.PLAYING
            ? (Date.now() - this.startTime) / 1000
            : 0;

        return {
            score: this.score,
            timeElapsed,
            moves: this.moves,
            accuracy: this.moves > 0 ? (this.matches / this.moves) * 100 : 0
        };
    }

    saveState(): any {
        return {
            cards: this.cards,
            moves: this.moves,
            matches: this.matches,
            score: this.score,
            startTime: this.startTime
        };
    }

    loadState(state: any): void {
        this.cards = state.cards;
        this.moves = state.moves;
        this.matches = state.matches;
        this.score = state.score;
        this.startTime = state.startTime;
    }

    // Public getter for rendering
    getCards(): Card[] {
        return this.cards;
    }
}
