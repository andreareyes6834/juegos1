export interface StoreItem {
  id: string;
  name: string;
  description: string;
  type: 'upgrade' | 'asset' | 'coins' | 'gems';
  category: string;
  price: number;
  currency: 'coins' | 'gems';
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isAvailable: boolean;
  requiredLevel: number;
  stock?: number;
  discount?: number;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  itemType: StoreItem['type'];
  price: number;
  currency: 'coins' | 'gems';
  purchasedAt: string;
  status: 'completed' | 'pending' | 'failed';
}

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'coins_small',
    name: 'Paquete de Coins Pequeño',
    description: '500 coins para usar en la plataforma',
    type: 'coins',
    category: 'currency',
    price: 100,
    currency: 'gems',
    image: '/items/coins_small.png',
    rarity: 'common',
    isAvailable: true,
    requiredLevel: 1,
    stock: null
  },
  {
    id: 'coins_medium',
    name: 'Paquete de Coins Mediano',
    description: '1500 coins + 200 bonus',
    type: 'coins',
    category: 'currency',
    price: 250,
    currency: 'gems',
    image: '/items/coins_medium.png',
    rarity: 'rare',
    isAvailable: true,
    requiredLevel: 2,
    stock: null
  },
  {
    id: 'coins_large',
    name: 'Paquete de Coins Grande',
    description: '5000 coins + 1000 bonus',
    type: 'coins',
    category: 'currency',
    price: 750,
    currency: 'gems',
    image: '/items/coins_large.png',
    rarity: 'epic',
    isAvailable: true,
    requiredLevel: 5,
    stock: null
  },
  {
    id: 'gems_starter',
    name: 'Paquete de Gems Inicial',
    description: '50 gems para compras premium',
    type: 'gems',
    category: 'currency',
    price: 500,
    currency: 'coins',
    image: '/items/gems_starter.png',
    rarity: 'common',
    isAvailable: true,
    requiredLevel: 1,
    stock: null
  },
  {
    id: 'gems_premium',
    name: 'Paquete de Gems Premium',
    description: '150 gems + 25 bonus',
    type: 'gems',
    category: 'currency',
    price: 1200,
    currency: 'coins',
    image: '/items/gems_premium.png',
    rarity: 'rare',
    isAvailable: true,
    requiredLevel: 3,
    stock: null
  },
  {
    id: 'gems_vip',
    name: 'Paquete de Gems VIP',
    description: '500 gems + 150 bonus',
    type: 'gems',
    category: 'currency',
    price: 3500,
    currency: 'coins',
    image: '/items/gems_vip.png',
    rarity: 'epic',
    isAvailable: true,
    requiredLevel: 7,
    stock: null
  },
  {
    id: 'background_cyber',
    name: 'Fondo Cyberpunk',
    description: 'Personaliza tu interfaz con estilo futurista',
    type: 'asset',
    category: 'background',
    price: 500,
    currency: 'coins',
    image: '/items/background_cyber.png',
    rarity: 'rare',
    isAvailable: true,
    requiredLevel: 3,
    stock: null
  },
  {
    id: 'background_nature',
    name: 'Fondo Natural',
    description: 'Relájate con paisajes naturales',
    type: 'asset',
    category: 'background',
    price: 750,
    currency: 'coins',
    image: '/items/background_nature.png',
    rarity: 'epic',
    isAvailable: true,
    requiredLevel: 5,
    stock: null
  },
  {
    id: 'avatar_ninja',
    name: 'Avatar Ninja',
    description: 'Desbloquea el avatar ninja exclusivo',
    type: 'asset',
    category: 'avatar',
    price: 300,
    currency: 'coins',
    image: '/items/avatar_ninja.png',
    rarity: 'rare',
    isAvailable: true,
    requiredLevel: 2,
    stock: null
  },
  {
    id: 'avatar_wizard',
    name: 'Avatar Mago',
    description: 'Conviértete en un poderoso mago',
    type: 'asset',
    category: 'avatar',
    price: 800,
    currency: 'coins',
    image: '/items/avatar_wizard.png',
    rarity: 'epic',
    isAvailable: true,
    requiredLevel: 5,
    stock: null
  },
  {
    id: 'upgrade_starter_pack',
    name: 'Paquete de Mejoras Inicial',
    description: '3 mejoras básicas con descuento',
    type: 'upgrade',
    category: 'bundle',
    price: 1000,
    currency: 'coins',
    image: '/items/upgrade_starter.png',
    rarity: 'rare',
    isAvailable: true,
    requiredLevel: 2,
    stock: null
  },
  {
    id: 'upgrade_advanced_pack',
    name: 'Paquete de Mejoras Avanzado',
    description: '5 mejoras avanzadas con gran descuento',
    type: 'upgrade',
    category: 'bundle',
    price: 3000,
    currency: 'coins',
    image: '/items/upgrade_advanced.png',
    rarity: 'epic',
    isAvailable: true,
    requiredLevel: 6,
    stock: null
  }
];

const PURCHASES_KEY = 'hb_game_purchases_v1';

export class StoreSystem {
  private items: StoreItem[] = STORE_ITEMS;

  constructor() {
    this.loadItems();
  }

  private loadItems(): void {
    const stored = localStorage.getItem('hb_store_items_v1');
    if (stored) {
      try {
        this.items = JSON.parse(stored);
      } catch {
        this.items = STORE_ITEMS;
      }
    }
  }

  private saveItems(): void {
    localStorage.setItem('hb_store_items_v1', JSON.stringify(this.items));
  }

  getAllItems(): StoreItem[] {
    return this.items.filter(item => item.isAvailable);
  }

  getItemsByType(type: StoreItem['type']): StoreItem[] {
    return this.getAllItems().filter(item => item.type === type);
  }

  getItemsByCategory(category: string): StoreItem[] {
    return this.getAllItems().filter(item => item.category === category);
  }

  getItemsByCurrency(currency: 'coins' | 'gems'): StoreItem[] {
    return this.getAllItems().filter(item => item.currency === currency);
  }

  getItemById(id: string): StoreItem | null {
    return this.getAllItems().find(item => item.id === id) || null;
  }

  getAvailableItems(userLevel: number, userCoins: number, userGems: number): StoreItem[] {
    return this.getAllItems().filter(item => 
      item.requiredLevel <= userLevel &&
      ((item.currency === 'coins' && item.price <= userCoins) ||
       (item.currency === 'gems' && item.price <= userGems))
    );
  }

  getAffordableItems(userCoins: number, userGems: number): StoreItem[] {
    return this.getAllItems().filter(item => 
      (item.currency === 'coins' && item.price <= userCoins) ||
      (item.currency === 'gems' && item.price <= userGems)
    );
  }

  canPurchase(itemId: string, userLevel: number, userCoins: number, userGems: number): boolean {
    const item = this.getItemById(itemId);
    if (!item || !item.isAvailable) return false;

    if (userLevel < item.requiredLevel) return false;

    return (item.currency === 'coins' && userCoins >= item.price) ||
           (item.currency === 'gems' && userGems >= item.price);
  }

  calculateFinalPrice(itemId: string): number {
    const item = this.getItemById(itemId);
    if (!item) return 0;

    let finalPrice = item.price;
    if (item.discount) {
      finalPrice = Math.floor(item.price * (1 - item.discount / 100));
    }
    return finalPrice;
  }

  purchaseItem(userId: string, itemId: string, userCoins: number, userGems: number): Purchase | null {
    const item = this.getItemById(itemId);
    if (!item) return null;

    if (!this.canPurchase(itemId, 1, userCoins, userGems)) return null;

    const finalPrice = this.calculateFinalPrice(itemId);
    const purchase: Purchase = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      itemId,
      itemType: item.type,
      price: finalPrice,
      currency: item.currency,
      purchasedAt: new Date().toISOString(),
      status: 'completed'
    };

    const purchases = this.getPurchases(userId);
    purchases.push(purchase);
    this.savePurchases(userId, purchases);

    return purchase;
  }

  getPurchases(userId: string): Purchase[] {
    const stored = localStorage.getItem(`${PURCHASES_KEY}_${userId}`);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  savePurchases(userId: string, purchases: Purchase[]): void {
    localStorage.setItem(`${PURCHASES_KEY}_${userId}`, JSON.stringify(purchases));
  }

  getPurchaseHistory(userId: string, limit: number = 50): Purchase[] {
    return this.getPurchases(userId)
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())
      .slice(0, limit);
  }

  getTotalSpent(userId: string, currency: 'coins' | 'gems'): number {
    return this.getPurchases(userId)
      .filter(p => p.currency === currency && p.status === 'completed')
      .reduce((total, p) => total + p.price, 0);
  }

  addItem(item: StoreItem): void {
    this.items.push(item);
    this.saveItems();
  }

  updateItem(itemId: string, updates: Partial<StoreItem>): boolean {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) return false;

    this.items[index] = { ...this.items[index], ...updates };
    this.saveItems();
    return true;
  }

  removeItem(itemId: string): boolean {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) return false;

    this.items.splice(index, 1);
    this.saveItems();
    return true;
  }

  setItemAvailability(itemId: string, isAvailable: boolean): boolean {
    return this.updateItem(itemId, { isAvailable });
  }

  applyDiscount(itemId: string, discount: number): boolean {
    if (discount < 0 || discount > 100) return false;
    return this.updateItem(itemId, { discount });
  }

  removeDiscount(itemId: string): boolean {
    return this.updateItem(itemId, { discount: undefined });
  }

  getFeaturedItems(limit: number = 6): StoreItem[] {
    return this.getAllItems()
      .filter(item => item.rarity === 'epic' || item.rarity === 'legendary')
      .slice(0, limit);
  }

  getNewArrivals(limit: number = 8): StoreItem[] {
    return this.getAllItems()
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, limit);
  }

  getRarityColor(rarity: StoreItem['rarity']): string {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#95a5a6';
    }
  }

  getRarityBorder(rarity: StoreItem['rarity']): string {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  }
}

export const storeSystem = new StoreSystem();
