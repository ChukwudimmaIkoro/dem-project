import { AppState, UserProfile, ThreeDayPlan } from '@/types';

const STORAGE_KEY = 'dem-app-state';
const ENERGY_MODAL_KEY = 'dem-energy-modal-shown';
const AI_CACHE_KEY = 'dem-ai-cache';

export interface CachedRecipe {
  name: string;
  tagline: string;
  prepTime: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  nutrition: { protein: string; carbs: string; fats: string; calories: string };
  tip: string;
}

export interface CachedInsight {
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  insight: string;
  patientMessage: string;
  careNote: string;
  alerts: { severity: string; type: string; message: string; recommendation: string }[];
}

export interface AICache {
  recipes: Record<string, CachedRecipe>;
  insights: Record<string, CachedInsight>;
}

// App State
export function loadAppState(): AppState {
  if (typeof window === 'undefined') return getDefaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getDefaultState();
  } catch { return getDefaultState(); }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.error('Error saving app state:', e); }
}

function getDefaultState(): AppState {
  return { user: null, currentPlan: null, hasCompletedOnboarding: false };
}

export function saveUserProfile(user: UserProfile): void {
  const state = loadAppState();
  state.user = user;
  state.hasCompletedOnboarding = true;
  saveAppState(state);
}

export function saveCurrentPlan(plan: ThreeDayPlan): void {
  const state = loadAppState();
  state.currentPlan = plan;
  saveAppState(state);
}

export function updatePlan(updater: (plan: ThreeDayPlan) => ThreeDayPlan): void {
  const state = loadAppState();
  if (state.currentPlan) {
    state.currentPlan = updater(state.currentPlan);
    saveAppState(state);
  }
}

// Energy Modal
export function saveEnergyModalShown(dayNumber: number): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(ENERGY_MODAL_KEY);
    const shown = stored ? JSON.parse(stored) : {};
    shown[dayNumber] = true;
    localStorage.setItem(ENERGY_MODAL_KEY, JSON.stringify(shown));
  } catch (e) { console.error(e); }
}

export function hasShownEnergyModal(dayNumber: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(ENERGY_MODAL_KEY);
    const shown = stored ? JSON.parse(stored) : {};
    return !!shown[dayNumber];
  } catch { return false; }
}

// AI Cache
function loadAICache(): AICache {
  if (typeof window === 'undefined') return { recipes: {}, insights: {} };
  try {
    const stored = localStorage.getItem(AI_CACHE_KEY);
    return stored ? JSON.parse(stored) : { recipes: {}, insights: {} };
  } catch { return { recipes: {}, insights: {} }; }
}

function saveAICache(cache: AICache): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache)); }
  catch (e) { console.error('Error saving AI cache:', e); }
}

export function getCachedRecipe(dayNumber: number, mealType: string): CachedRecipe | null {
  return loadAICache().recipes[`${dayNumber}-${mealType}`] ?? null;
}

export function setCachedRecipe(dayNumber: number, mealType: string, recipe: CachedRecipe): void {
  const cache = loadAICache();
  cache.recipes[`${dayNumber}-${mealType}`] = recipe;
  saveAICache(cache);
}

export function getCachedInsight(dayNumber: number): CachedInsight | null {
  return loadAICache().insights[`${dayNumber}`] ?? null;
}

export function setCachedInsight(dayNumber: number, insight: CachedInsight): void {
  const cache = loadAICache();
  cache.insights[`${dayNumber}`] = insight;
  saveAICache(cache);
}

export function clearAppState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ENERGY_MODAL_KEY);
  localStorage.removeItem(AI_CACHE_KEY);
}