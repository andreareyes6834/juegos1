export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: 'score' | 'speed' | 'luck' | 'bonus';
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectPerLevel: number;
  icon: string;
  requiredLevel: number;
}

export interface UserUpgrade {
  upgradeId: string;
  level: number;
  purchasedAt: string;
}

export const AVAILABLE_UPGRADES: Upgrade[] = [
  {
    id: 'score_boost',
    name: 'Potenciador de Puntuación',
    description: 'Aumenta la puntuación base en un 10% por nivel',
    category: 'score',
    maxLevel: 10,
    baseCost: 100,
    costMultiplier: 1.5,
    effectPerLevel: 0.1,
    icon: '🎯',
    requiredLevel: 1
  },
  {
    id: 'speed_master',
    name: 'Maestro de Velocidad',
    description: 'Reduce el tiempo de juego en un 5% por nivel',
    category: 'speed',
    maxLevel: 8,
    baseCost: 150,
    costMultiplier: 1.6,
    effectPerLevel: 0.05,
    icon: '⚡',
    requiredLevel: 2
  },
  {
    id: 'lucky_charm',
    name: 'Amuleto de la Suerte',
    description: 'Aumenta la probabilidad de bonus en un 8% por nivel',
    category: 'luck',
    maxLevel: 12,
    baseCost: 200,
    costMultiplier: 1.4,
    effectPerLevel: 0.08,
    icon: '🍀',
    requiredLevel: 3
  },
  {
    id: 'coin_magnet',
    name: 'Imán de Monedas',
    description: 'Gana 5% más de coins por partida',
    category: 'bonus',
    maxLevel: 15,
    baseCost: 250,
    costMultiplier: 1.3,
    effectPerLevel: 0.05,
    icon: '🧲',
    requiredLevel: 5
  },
  {
    id: 'xp_accelerator',
    name: 'Acelerador de XP',
    description: 'Gana 15% más de XP por partida',
    category: 'bonus',
    maxLevel: 10,
    baseCost: 300,
    costMultiplier: 1.5,
    effectPerLevel: 0.15,
    icon: '📈',
    requiredLevel: 7
  },
  {
    id: 'critical_strike',
    name: 'Golpe Crítico',
    description: 'Probabilidad de puntuación crítica (2x) del 3% por nivel',
    category: 'score',
    maxLevel: 8,
    baseCost: 400,
    costMultiplier: 1.7,
    effectPerLevel: 0.03,
    icon: '💥',
    requiredLevel: 10
  },
  {
    id: 'energy_saver',
    name: 'Ahorro de Energía',
    description: 'Reduce el costo de entrada en un 2% por nivel',
    category: 'bonus',
    maxLevel: 10,
    baseCost: 180,
    costMultiplier: 1.4,
    effectPerLevel: 0.02,
    icon: '🔋',
    requiredLevel: 4
  },
  {
    id: 'precision_focus',
    name: 'Enfoque de Precisión',
    description: 'Aumenta la precisión en juegos de habilidad un 4% por nivel',
    category: 'score',
    maxLevel: 12,
    baseCost: 220,
    costMultiplier: 1.45,
    effectPerLevel: 0.04,
    icon: '🎪',
    requiredLevel: 6
  }
];

export class UpgradeSystem {
  calculateCost(upgradeId: string, currentLevel: number): number {
    const upgrade = AVAILABLE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return 0;

    if (currentLevel >= upgrade.maxLevel) return 0;

    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  }

  canPurchase(upgradeId: string, userCoins: number, userLevel: number, currentLevel: number): boolean {
    const upgrade = AVAILABLE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    if (userLevel < upgrade.requiredLevel) return false;
    if (currentLevel >= upgrade.maxLevel) return false;

    const cost = this.calculateCost(upgradeId, currentLevel);
    return userCoins >= cost;
  }

  calculateEffect(upgradeId: string, level: number): number {
    const upgrade = AVAILABLE_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade || level <= 0) return 0;

    return level * upgrade.effectPerLevel;
  }

  getUserUpgradeEffect(userUpgrades: UserUpgrade[], upgradeId: string): number {
    const userUpgrade = userUpgrades.find(u => u.upgradeId === upgradeId);
    return userUpgrade ? this.calculateEffect(upgradeId, userUpgrade.level) : 0;
  }

  getTotalMultiplier(userUpgrades: UserUpgrade[], category: Upgrade['category']): number {
    let multiplier = 1;

    AVAILABLE_UPGRADES
      .filter(u => u.category === category)
      .forEach(upgrade => {
        const effect = this.getUserUpgradeEffect(userUpgrades, upgrade.id);
        multiplier += effect;
      });

    return multiplier;
  }

  getAvailableUpgrades(userLevel: number): Upgrade[] {
    return AVAILABLE_UPGRADES.filter(u => u.requiredLevel <= userLevel);
  }

  getUpgradeById(upgradeId: string): Upgrade | null {
    return AVAILABLE_UPGRADES.find(u => u.id === upgradeId) || null;
  }

  getMaxLevel(upgradeId: string): number {
    const upgrade = this.getUpgradeById(upgradeId);
    return upgrade ? upgrade.maxLevel : 0;
  }

  getNextLevelEffect(upgradeId: string, currentLevel: number): number {
    return this.calculateEffect(upgradeId, currentLevel + 1) - this.calculateEffect(upgradeId, currentLevel);
  }
}

export const upgradeSystem = new UpgradeSystem();
