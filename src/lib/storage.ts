import { AppState, UserProfile, ThreeDayPlan } from '@/types';

const STORAGE_KEY = 'dem-app-state';

/**
 * Load app state from localStorage
 */
export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultState();
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading app state:', error);
    return getDefaultState();
  }
}

/**
 * Save app state to localStorage
 */
export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving app state:', error);
  }
}

/**
 * Default app state
 */
function getDefaultState(): AppState {
  return {
    user: null,
    currentPlan: null,
    hasCompletedOnboarding: false,
  };
}

/**
 * Save user profile
 */
export function saveUserProfile(user: UserProfile): void {
  const state = loadAppState();
  state.user = user;
  state.hasCompletedOnboarding = true;
  saveAppState(state);
}

/**
 * Save current plan
 */
export function saveCurrentPlan(plan: ThreeDayPlan): void {
  const state = loadAppState();
  state.currentPlan = plan;
  saveAppState(state);
}

/**
 * Update plan (e.g., when completing tasks)
 */
export function updatePlan(updater: (plan: ThreeDayPlan) => ThreeDayPlan): void {
  const state = loadAppState();
  if (state.currentPlan) {
    state.currentPlan = updater(state.currentPlan);
    saveAppState(state);
  }
}

/**
 * Save which days have shown the energy modal
 */
export function saveEnergyModalShown(dayNumber: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = 'dem-energy-modal-shown';
    const stored = localStorage.getItem(key);
    const shown = stored ? JSON.parse(stored) : {};
    shown[dayNumber] = true;
    localStorage.setItem(key, JSON.stringify(shown));
  } catch (error) {
    console.error('Error saving energy modal state:', error);
  }
}

/**
 * Check if energy modal has been shown for a day
 */
export function hasShownEnergyModal(dayNumber: number): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const key = 'dem-energy-modal-shown';
    const stored = localStorage.getItem(key);
    const shown = stored ? JSON.parse(stored) : {};
    return !!shown[dayNumber];
  } catch (error) {
    return false;
  }
}

/**
 * Clear all data (reset app)
 */
export function clearAppState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('dem-energy-modal-shown');
}