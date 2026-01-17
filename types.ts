
export type ViewState = 'HOME' | 'STORE' | 'PROFILE' | 'ADMIN' | 'CASES' | 'BLOG' | 'GAME_CENTER' | 'PLAYING_GAME';

export interface UserProfile {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  maxXp: number;
  balance: number; 
  plan: 'Normal' | 'Intermedio' | 'Premium';
  coins: number; 
  gems: number;  
}

export interface LegalService {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  icon: string;
}

export interface JudicialCase {
  id: string;
  causa: string;
  provincia: string;
  actor: string;
  demandado: string;
  estado: 'Trámite' | 'Sentencia' | 'Archivo';
  fecha: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface Game {
  id: string;
  title: string;
  image: string;
  description: string;
  category: 'Slots' | 'Roulette' | 'Poker' | 'Arcade' | 'Strategy';
  minBet: number;
  isPremium: boolean;
  popularity: number;
  rtp?: string; // Return to Player (Casino Stat)
  volatility?: 'Low' | 'Medium' | 'High';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export type GameState = 'INIT' | 'LOADING' | 'READY' | 'PLAYING' | 'PAUSED' | 'FINISHED' | 'REWARD' | 'EXIT';
