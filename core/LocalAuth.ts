export interface AuthUser {
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Session {
  username: string;
}

const USERS_KEY = 'auth_users_v1';
const SESSION_KEY = 'auth_session_v1';

function getUsers(): AuthUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(u => u && typeof u.username === 'string' && typeof u.passwordHash === 'string' && typeof u.salt === 'string') as AuthUser[];
  } catch {
    return [];
  }
}

function setUsers(users: AuthUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof (parsed as any).username !== 'string') return null;
    return { username: (parsed as any).username };
  } catch {
    return null;
  }
}

function setSession(session: Session | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
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
  return new Uint8Array(bits);
}

export async function register(username: string, password: string): Promise<Session> {
  const clean = username.trim();
  if (!clean) throw new Error('Usuario requerido');
  if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === clean.toLowerCase())) {
    throw new Error('El usuario ya existe');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);

  const next: AuthUser = {
    username: clean,
    salt: toBase64(salt),
    passwordHash: toBase64(hash),
    createdAt: new Date().toISOString()
  };

  users.push(next);
  setUsers(users);

  const session = { username: clean };
  setSession(session);
  return session;
}

export async function login(username: string, password: string): Promise<Session> {
  const clean = username.trim();
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === clean.toLowerCase());
  if (!user) throw new Error('Usuario o contraseña inválidos');

  const salt = fromBase64(user.salt);
  const hash = await pbkdf2(password, salt);
  const hashB64 = toBase64(hash);

  if (hashB64 !== user.passwordHash) {
    throw new Error('Usuario o contraseña inválidos');
  }

  const session = { username: user.username };
  setSession(session);
  return session;
}

export function logout(): void {
  setSession(null);
}

export function readSession(): Session | null {
  return getSession();
}
