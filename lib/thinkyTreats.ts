const FREE_TREATS_PER_DAY = 2;
const KEY_PREFIX = 'dem-treats-';
const CLOUD_KEY  = 'thinky-treats';

const TIER_LIMITS: Record<string, number> = {
  basic:          2,
  ad_free:        2,
  premium:        5,
  premium_plus: 100,
};

export function getEffectiveDailyLimit(): number {
  if (typeof window === 'undefined') return FREE_TREATS_PER_DAY;
  try {
    const stored = localStorage.getItem('dem-app-state');
    if (!stored) return FREE_TREATS_PER_DAY;
    const tier = JSON.parse(stored)?.user?.subscriptionTier ?? 'basic';
    return TIER_LIMITS[tier] ?? FREE_TREATS_PER_DAY;
  } catch { return FREE_TREATS_PER_DAY; }
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayKey(): string {
  return KEY_PREFIX + todayDateString();
}

export function getTreatsUsedToday(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(todayKey()) ?? '0', 10);
  } catch { return 0; }
}

export function getTreatsRemainingToday(): number {
  return Math.max(0, getEffectiveDailyLimit() - getTreatsUsedToday());
}

export function hasTreatsLeft(): boolean {
  return getTreatsRemainingToday() > 0;
}

export function useTreat(): boolean {
  if (!hasTreatsLeft()) return false;
  if (typeof window === 'undefined') return false;
  try {
    const used = getTreatsUsedToday() + 1;
    localStorage.setItem(todayKey(), String(used));
    window.dispatchEvent(new Event('treats-updated'));
    window.dispatchEvent(new Event('treat-consumed'));
    return true;
  } catch { return false; }
}

/** Serialise today's usage for cloud sync */
export function getTreatsCloudPayload(): { date: string; used: number } {
  return { date: todayDateString(), used: getTreatsUsedToday() };
}

/** Wipe today's local treat count — call before restoring from cloud on sign-in. */
export function clearTreatsLocally(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(todayKey());
}

/** Dev-only: reset today's treats to zero and notify all listeners. */
export function devResetTreats(): void {
  clearTreatsLocally();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('treats-updated'));
}

/** Restore from cloud. Always overwrites local so accounts don't bleed into each other. */
export function restoreTreatsFromCloud(payload: { date: string; used: number }): void {
  if (typeof window === 'undefined') return;
  clearTreatsLocally();
  if (payload.date !== todayDateString()) return;
  localStorage.setItem(todayKey(), String(payload.used));
}

export const FREE_DAILY_LIMIT = FREE_TREATS_PER_DAY;
export const TREATS_CLOUD_KEY = CLOUD_KEY;
export { TIER_LIMITS };
