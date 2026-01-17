export interface Asset {
  id: string;
  name: string;
  type: 'background' | 'avatar' | 'icon' | 'sound' | 'music';
  url: string;
  previewUrl?: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price: number;
  unlockLevel: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface UserAsset {
  assetId: string;
  unlockedAt: string;
  isEquipped: boolean;
}

export const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'bg_default',
    name: 'Espacio Nebulosa',
    type: 'background',
    url: '/assets/backgrounds/default.jpg',
    previewUrl: '/assets/backgrounds/default_preview.jpg',
    category: 'space',
    rarity: 'common',
    price: 0,
    unlockLevel: 1,
    isDefault: true,
    isActive: true
  },
  {
    id: 'bg_cyber_city',
    name: 'Ciudad Cyberpunk',
    type: 'background',
    url: '/assets/backgrounds/cyber_city.jpg',
    previewUrl: '/assets/backgrounds/cyber_city_preview.jpg',
    category: 'urban',
    rarity: 'rare',
    price: 500,
    unlockLevel: 3,
    isDefault: false,
    isActive: true
  },
  {
    id: 'bg_fantasy_forest',
    name: 'Bosque Fantástico',
    type: 'background',
    url: '/assets/backgrounds/fantasy_forest.jpg',
    previewUrl: '/assets/backgrounds/fantasy_forest_preview.jpg',
    category: 'nature',
    rarity: 'epic',
    price: 1000,
    unlockLevel: 5,
    isDefault: false,
    isActive: true
  },
  {
    id: 'bg_ocean_depths',
    name: 'Profundidades Oceánicas',
    type: 'background',
    url: '/assets/backgrounds/ocean_depths.jpg',
    previewUrl: '/assets/backgrounds/ocean_depths_preview.jpg',
    category: 'nature',
    rarity: 'legendary',
    price: 2000,
    unlockLevel: 8,
    isDefault: false,
    isActive: true
  },
  {
    id: 'bg_desert_sunset',
    name: 'Atardecer del Desierto',
    type: 'background',
    url: '/assets/backgrounds/desert_sunset.jpg',
    previewUrl: '/assets/backgrounds/desert_sunset_preview.jpg',
    category: 'nature',
    rarity: 'rare',
    price: 750,
    unlockLevel: 4,
    isDefault: false,
    isActive: true
  },
  {
    id: 'bg_mountain_peak',
    name: 'Cima Montañosa',
    type: 'background',
    url: '/assets/backgrounds/mountain_peak.jpg',
    previewUrl: '/assets/backgrounds/mountain_peak_preview.jpg',
    category: 'nature',
    rarity: 'epic',
    price: 1500,
    unlockLevel: 6,
    isDefault: false,
    isActive: true
  },
  {
    id: 'avatar_default',
    name: 'Avatar por Defecto',
    type: 'avatar',
    url: '/assets/avatars/default.png',
    previewUrl: '/assets/avatars/default_preview.png',
    category: 'basic',
    rarity: 'common',
    price: 0,
    unlockLevel: 1,
    isDefault: true,
    isActive: true
  },
  {
    id: 'avatar_ninja',
    name: 'Ninja',
    type: 'avatar',
    url: '/assets/avatars/ninja.png',
    previewUrl: '/assets/avatars/ninja_preview.png',
    category: 'warrior',
    rarity: 'rare',
    price: 300,
    unlockLevel: 2,
    isDefault: false,
    isActive: true
  },
  {
    id: 'avatar_wizard',
    name: 'Mago',
    type: 'avatar',
    url: '/assets/avatars/wizard.png',
    previewUrl: '/assets/avatars/wizard_preview.png',
    category: 'magic',
    rarity: 'epic',
    price: 800,
    unlockLevel: 5,
    isDefault: false,
    isActive: true
  },
  {
    id: 'avatar_cyber',
    name: 'Cyberpunk',
    type: 'avatar',
    url: '/assets/avatars/cyber.png',
    previewUrl: '/assets/avatars/cyber_preview.png',
    category: 'tech',
    rarity: 'legendary',
    price: 1500,
    unlockLevel: 7,
    isDefault: false,
    isActive: true
  }
];

const ASSETS_KEY = 'hb_game_assets_v1';
const USER_ASSETS_KEY = 'hb_user_assets_v1';

export class AssetManager {
  private assets: Asset[] = DEFAULT_ASSETS;

  constructor() {
    this.loadAssets();
  }

  private loadAssets(): void {
    const stored = localStorage.getItem(ASSETS_KEY);
    if (stored) {
      try {
        this.assets = JSON.parse(stored);
      } catch {
        this.assets = DEFAULT_ASSETS;
      }
    }
  }

  private saveAssets(): void {
    localStorage.setItem(ASSETS_KEY, JSON.stringify(this.assets));
  }

  getAllAssets(): Asset[] {
    return this.assets.filter(a => a.isActive);
  }

  getAssetsByType(type: Asset['type']): Asset[] {
    return this.getAllAssets().filter(a => a.type === type);
  }

  getAssetsByCategory(category: string): Asset[] {
    return this.getAllAssets().filter(a => a.category === category);
  }

  getAssetsByRarity(rarity: Asset['rarity']): Asset[] {
    return this.getAllAssets().filter(a => a.rarity === rarity);
  }

  getAssetById(id: string): Asset | null {
    return this.getAllAssets().find(a => a.id === id) || null;
  }

  getAvailableAssets(userLevel: number, userCoins: number): Asset[] {
    return this.getAllAssets().filter(a => 
      a.unlockLevel <= userLevel && 
      a.price <= userCoins &&
      !a.isDefault
    );
  }

  getUserAssets(userId: string): UserAsset[] {
    const stored = localStorage.getItem(`${USER_ASSETS_KEY}_${userId}`);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  saveUserAssets(userId: string, assets: UserAsset[]): void {
    localStorage.setItem(`${USER_ASSETS_KEY}_${userId}`, JSON.stringify(assets));
  }

  unlockAsset(userId: string, assetId: string): boolean {
    const asset = this.getAssetById(assetId);
    if (!asset || asset.isDefault) return false;

    const userAssets = this.getUserAssets(userId);
    if (userAssets.some(ua => ua.assetId === assetId)) return false;

    const newUserAsset: UserAsset = {
      assetId,
      unlockedAt: new Date().toISOString(),
      isEquipped: false
    };

    userAssets.push(newUserAsset);
    this.saveUserAssets(userId, userAssets);
    return true;
  }

  equipAsset(userId: string, assetId: string): boolean {
    const asset = this.getAssetById(assetId);
    if (!asset) return false;

    const userAssets = this.getUserAssets(userId);
    const userAsset = userAssets.find(ua => ua.assetId === assetId);
    
    if (!userAsset) return false;

    userAssets.forEach(ua => {
      if (ua.assetId === assetId) {
        ua.isEquipped = true;
      } else if (this.getAssetById(ua.assetId)?.type === asset.type) {
        ua.isEquipped = false;
      }
    });

    this.saveUserAssets(userId, userAssets);
    return true;
  }

  getEquippedAssets(userId: string): Asset[] {
    const userAssets = this.getUserAssets(userId);
    const equippedAssetIds = userAssets.filter(ua => ua.isEquipped).map(ua => ua.assetId);
    
    return equippedAssetIds
      .map(id => this.getAssetById(id))
      .filter((a): a is Asset => a !== null);
  }

  getUserUnlockedAssets(userId: string): Asset[] {
    const userAssets = this.getUserAssets(userId);
    const unlockedAssetIds = userAssets.map(ua => ua.assetId);
    
    return unlockedAssetIds
      .map(id => this.getAssetById(id))
      .filter((a): a is Asset => a !== null);
  }

  purchaseAsset(userId: string, assetId: string, userCoins: number): boolean {
    const asset = this.getAssetById(assetId);
    if (!asset || asset.isDefault) return false;

    if (userCoins < asset.price) return false;

    const unlocked = this.unlockAsset(userId, assetId);
    if (!unlocked) return false;

    return true;
  }

  addAsset(asset: Asset): void {
    this.assets.push(asset);
    this.saveAssets();
  }

  updateAsset(assetId: string, updates: Partial<Asset>): boolean {
    const index = this.assets.findIndex(a => a.id === assetId);
    if (index === -1) return false;

    this.assets[index] = { ...this.assets[index], ...updates };
    this.saveAssets();
    return true;
  }

  deactivateAsset(assetId: string): boolean {
    return this.updateAsset(assetId, { isActive: false });
  }

  getRarityColor(rarity: Asset['rarity']): string {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#95a5a6';
    }
  }

  getRarityBorder(rarity: Asset['rarity']): string {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  }
}

export const assetManager = new AssetManager();
