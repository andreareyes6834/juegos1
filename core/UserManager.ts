export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'user' | 'admin';
  avatar: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalGamesPlayed: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  coins: number;
  gems: number;
  achievements: string[];
  unlockedBackgrounds: string[];
  selectedBackground: string;
  upgrades: UserUpgrade[];
}

export interface UserUpgrade {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  cost: number;
  effect: string;
  value: number;
  purchasedAt: string;
}

const USERS_KEY = 'hb_games_users_v2';
const PROFILES_KEY = 'hb_games_profiles_v2';

function getUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getProfiles(): UserProfile[] {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltCopy = new Uint8Array(salt.byteLength);
  saltCopy.set(salt);
  const saltBuffer: ArrayBuffer = saltCopy.buffer;
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBuffer,
      iterations: 150000
    },
    keyMaterial,
    256
  );
  return toBase64(new Uint8Array(bits));
}

export class UserManager {
  async register(username: string, email: string, password: string): Promise<User> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Email inválido');
    }

    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const users = getUsers();
    
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('El nombre de usuario ya existe');
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('El email ya está registrado');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(password, salt);

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      salt: toBase64(salt),
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanUsername)}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };

    users.push(user);
    setUsers(users);

    this.createProfile(user.id, cleanUsername, cleanEmail, user.avatar, user.role);

    return user;
  }

  async login(usernameOrEmail: string, password: string): Promise<User> {
    const clean = usernameOrEmail.trim().toLowerCase();
    const users = getUsers();
    const user = users.find(u => 
      u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!user || !user.isActive) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const salt = fromBase64(user.salt);
    const hash = await hashPassword(password, salt);

    if (hash !== user.passwordHash) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    user.lastLogin = new Date().toISOString();
    setUsers(users);

    return user;
  }

  getUserById(id: string): User | null {
    const users = getUsers();
    return users.find(u => u.id === id) || null;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'passwordHash' | 'salt'>>): User {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      throw new Error('Usuario no encontrado');
    }

    users[index] = { ...users[index], ...updates };
    setUsers(users);
    return users[index];
  }

  createProfile(userId: string, username: string, email: string, avatar: string, role: 'user' | 'admin'): void {
    const profiles = getProfiles();
    
    if (profiles.some(p => p.id === userId)) {
      return;
    }

    const profile: UserProfile = {
      id: userId,
      username,
      email,
      role,
      avatar,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalGamesPlayed: 0,
      totalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      coins: 1000,
      gems: 10,
      achievements: [],
      unlockedBackgrounds: ['default'],
      selectedBackground: 'default',
      upgrades: []
    };

    profiles.push(profile);
    setProfiles(profiles);
  }

  getProfile(userId: string): UserProfile | null {
    const profiles = getProfiles();
    return profiles.find(p => p.id === userId) || null;
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const profiles = getProfiles();
    const index = profiles.findIndex(p => p.id === userId);
    
    if (index === -1) {
      throw new Error('Perfil no encontrado');
    }

    profiles[index] = { ...profiles[index], ...updates };
    setProfiles(profiles);
    return profiles[index];
  }

  getAllUsers(): User[] {
    return getUsers();
  }

  getAllProfiles(): UserProfile[] {
    return getProfiles();
  }

  deactivateUser(userId: string): void {
    this.updateUser(userId, { isActive: false });
  }

  promoteToAdmin(userId: string): void {
    this.updateUser(userId, { role: 'admin' });
    this.updateProfile(userId, { role: 'admin' });
  }
}

export const userManager = new UserManager();
