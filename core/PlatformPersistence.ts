export interface PlatformUserState {
  wallet: {
    softTokens: number;
    hardTokens: number;
  };
  progress: {
    level: number;
    xp: number;
    xpToNextLevel: number;
    totalGamesPlayed: number;
    totalScore: number;
    currentStreak: number;
    longestStreak: number;
    dailyRewardClaimed: boolean;
    dailyRewardStreak: number;
  };
}

function key(username: string): string {
  return `platform_state_v1:${username}`;
}

export function loadUserState(username: string): PlatformUserState | null {
  const raw = localStorage.getItem(key(username));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as PlatformUserState;
  } catch {
    return null;
  }
}

export function saveUserState(username: string, state: PlatformUserState): void {
  localStorage.setItem(key(username), JSON.stringify(state));
}

export function clearUserState(username: string): void {
  localStorage.removeItem(key(username));
}
