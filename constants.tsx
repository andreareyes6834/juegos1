
import { LegalService, SubscriptionPlan, JudicialCase, UserProfile, Achievement, Game } from './types';

export const LEGAL_SERVICES: LegalService[] = [
  { id: '1', title: 'Defensa Criminal Elite', category: 'Penal', description: 'Protección constitucional de alto nivel en procesos complejos.', price: 1200, icon: 'Shield' },
  { id: '2', title: 'Litigio Civil Corporativo', category: 'Corporativo', description: 'Resolución estratégica de conflictos mercantiles y societarios.', price: 1500, icon: 'Gavel' },
  { id: '3', title: 'Consultoría Familiar Premium', category: 'Familia', description: 'Mediación y procesos de familia con total discreción.', price: 800, icon: 'Users' },
  { id: '4', title: 'Derecho Laboral Ejecutivo', category: 'Laboral', description: 'Protección de derechos para directivos y empresas.', price: 950, icon: 'Briefcase' },
];

export const MOCK_GAMES: Game[] = [
  {
    id: 'snake',
    title: 'Neon Snake',
    category: 'Arcade',
    image: 'https://images.unsplash.com/photo-1614292261347-4f6f124f0d7d?w=800',
    description: 'Clásico retro: crece, evita colisiones y rompe récords.',
    minBet: 10,
    isPremium: false,
    popularity: 91,
    rtp: 'Skill Based',
    volatility: 'Medium'
  },
  {
    id: '2048',
    title: '2048 Fusion',
    category: 'Strategy',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
    description: 'Combina tiles, crea cadenas y llega al 2048 (o más).',
    minBet: 15,
    isPremium: false,
    popularity: 89,
    rtp: 'Skill Based',
    volatility: 'Low'
  },
  {
    id: 'pong',
    title: 'Pong Quantum',
    category: 'Arcade',
    image: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=800',
    description: 'Retro competitivo: reacción, control y rachas.',
    minBet: 20,
    isPremium: false,
    popularity: 87,
    rtp: 'Skill Based',
    volatility: 'Medium'
  },
  {
    id: 'tictactoe',
    title: 'TicTacToe Blitz',
    category: 'Strategy',
    image: 'https://images.unsplash.com/photo-1614064642633-e398cf2d2406?w=800',
    description: 'Lógica rápida: gana o fuerza el draw. Perfecto para torneos.',
    minBet: 5,
    isPremium: false,
    popularity: 86,
    rtp: 'Skill Based',
    volatility: 'Low'
  },
  {
    id: 'connect4',
    title: 'Connect 4 Arena',
    category: 'Strategy',
    image: 'https://images.unsplash.com/photo-1606946459281-8b5d1b0b7a8b?w=800',
    description: 'Conecta 4 en vertical/horizontal/diagonal. Puro mind-game.',
    minBet: 12,
    isPremium: false,
    popularity: 90,
    rtp: 'Skill Based',
    volatility: 'Low'
  },
  {
    id: 'memory',
    title: 'Memory Matrix',
    category: 'Arcade',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    description: 'Encuentra parejas, optimiza movimientos y sube tu precisión.',
    minBet: 10,
    isPremium: false,
    popularity: 88,
    rtp: 'Skill Based',
    volatility: 'Low'
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'plan-normal', name: 'Justice Silver', price: 49.99, features: ['Consultas SRI Express', '2 Asesorías Legales/mes', 'Acceso Casino Bronze'] },
  { id: 'plan-intermedio', name: 'Justice Gold', price: 149.99, features: ['Litigio Civil Básico', '5 Asesorías Legales/mes', 'Acceso VIP Casino', '150 Gems/mes'], isPopular: true },
  { id: 'plan-premium', name: 'Supreme Member', price: 499.99, features: ['Patrocinio Ilimitado', 'Consultoría 24/7 VIP', 'Suite de Juegos Privada', '500 Gems/mes', 'Cashback Legal'] },
];

export const INITIAL_PROFILE: UserProfile = {
  username: 'Wilson Ipiales',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wilson',
  level: 42,
  xp: 7800,
  maxXp: 10000,
  balance: 15450.75,
  plan: 'Premium',
  coins: 125000,
  gems: 1250,
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Magistrado', description: 'Ganaste 50 partidas de Roulette.', icon: '🏛️', unlocked: true },
  { id: '2', title: 'High Roller', description: 'Apostaste 10,000 coins en una mano.', icon: '💰', unlocked: true },
  { id: '3', title: 'Defensor Supremo', description: 'Completaste todos los servicios legales.', icon: '🛡️', unlocked: false },
];
