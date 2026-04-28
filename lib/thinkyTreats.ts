const FREE_TREATS_PER_DAY = 2;
const KEY_PREFIX = 'dem-treats-';

function todayKey(): string {
  return KEY_PREFIX + new Date().toISOString().slice(0, 10); // e.g. dem-treats-2026-04-28
}

export function getTreatsUsedToday(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(todayKey()) ?? '0', 10);
  } catch { return 0; }
}

export function getTreatsRemainingToday(): number {
  return Math.max(0, FREE_TREATS_PER_DAY - getTreatsUsedToday());
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
    return true;
  } catch { return false; }
}

export const FREE_DAILY_LIMIT = FREE_TREATS_PER_DAY;
