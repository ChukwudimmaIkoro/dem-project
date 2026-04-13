/**
 * Supabase-backed storage layer.
 * Same function signatures as lib/storage.ts — swap in when user is authenticated.
 * Unauthenticated users always fall back to localStorage via storage.ts.
 */

import { supabase } from './supabase';
import { UserProfile, ThreeDayPlan } from '@/types';
import {
  CachedRecipe, CachedInsight, CachedExerciseCoach,
  saveUserProfile as lsSaveUserProfile,
  saveCurrentPlan as lsSaveCurrentPlan,
} from './storage';

// ─── User profile ─────────────────────────────────────────────────────────────

export async function syncUserProfile(user: UserProfile): Promise<void> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return;

  await supabase.from('user_profiles').upsert({
    id:                     authUser.id,
    name:                   user.name,
    goals:                  user.goals ?? [],
    selected_foods:         user.selectedFoods ?? [],
    selected_exercises:     user.selectedExercises ?? [],
    selected_mentality:     user.selectedMentality ?? [],
    no_food_preference:     user.noFoodPreference ?? false,
    no_exercise_preference: user.noExercisePreference ?? false,
    no_mentality_preference:user.noMentalityPreference ?? false,
    created_at:             user.createdAt,
  });

  // Keep localStorage in sync too
  lsSaveUserProfile(user);
}

export async function loadUserProfile(): Promise<UserProfile | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!data) return null;

  return {
    name:                   data.name,
    goals:                  data.goals ?? [],
    selectedFoods:          data.selected_foods ?? [],
    selectedExercises:      data.selected_exercises ?? [],
    selectedMentality:      data.selected_mentality ?? [],
    noFoodPreference:       data.no_food_preference,
    noExercisePreference:   data.no_exercise_preference,
    noMentalityPreference:  data.no_mentality_preference,
    createdAt:              data.created_at,
  };
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

export async function syncPlan(plan: ThreeDayPlan): Promise<void> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return;

  // Deactivate any previous active plans
  await supabase
    .from('user_plans')
    .update({ is_active: false })
    .eq('user_id', authUser.id)
    .eq('is_active', true)
    .neq('id', plan.id);

  await supabase.from('user_plans').upsert({
    id:        plan.id,
    user_id:   authUser.id,
    plan_data: plan,
    is_active: true,
  });

  // Keep localStorage in sync
  lsSaveCurrentPlan(plan);
}

export async function deactivateCloudPlan(): Promise<void> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return;
  await supabase
    .from('user_plans')
    .update({ is_active: false })
    .eq('user_id', authUser.id)
    .eq('is_active', true);
}

export async function loadActivePlan(): Promise<ThreeDayPlan | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabase
    .from('user_plans')
    .select('plan_data')
    .eq('user_id', authUser.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data ? (data.plan_data as ThreeDayPlan) : null;
}

// ─── AI cache ─────────────────────────────────────────────────────────────────

async function getAuthUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function getCachedValue<T>(key: string): Promise<T | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const { data } = await supabase
    .from('ai_cache')
    .select('cache_value')
    .eq('user_id', userId)
    .eq('cache_key', key)
    .single();

  return data ? (data.cache_value as T) : null;
}

async function setCachedValue(key: string, value: object, planId?: string): Promise<void> {
  const userId = await getAuthUserId();
  if (!userId) return;

  await supabase.from('ai_cache').upsert({
    user_id:     userId,
    plan_id:     planId ?? null,
    cache_key:   key,
    cache_value: value,
  }, { onConflict: 'user_id,cache_key' });
}

export async function getCloudCachedRecipe(dayNumber: number, mealType: string): Promise<CachedRecipe | null> {
  return getCachedValue<CachedRecipe>(`recipe-${dayNumber}-${mealType}`);
}

export async function setCloudCachedRecipe(dayNumber: number, mealType: string, recipe: CachedRecipe): Promise<void> {
  return setCachedValue(`recipe-${dayNumber}-${mealType}`, recipe);
}

export async function getCloudCachedInsight(dayNumber: number): Promise<CachedInsight | null> {
  return getCachedValue<CachedInsight>(`insight-${dayNumber}`);
}

export async function setCloudCachedInsight(dayNumber: number, insight: CachedInsight): Promise<void> {
  return setCachedValue(`insight-${dayNumber}`, insight);
}

export async function getCloudCachedExercise(exerciseId: string, energyLevel: string): Promise<CachedExerciseCoach | null> {
  return getCachedValue<CachedExerciseCoach>(`exercise-${exerciseId}-${energyLevel}`);
}

export async function setCloudCachedExercise(exerciseId: string, energyLevel: string, coaching: CachedExerciseCoach): Promise<void> {
  return setCachedValue(`exercise-${exerciseId}-${energyLevel}`, coaching);
}

// ─── Migration: localStorage → Supabase ──────────────────────────────────────

/**
 * Called once on sign-up or sign-in when local data exists.
 * Pushes whatever is in localStorage up to Supabase so the user
 * doesn't lose their onboarding data when they create an account.
 */
export async function migrateLocalDataToSupabase(
  localUser: UserProfile,
  localPlan: ThreeDayPlan,
): Promise<void> {
  await Promise.all([
    syncUserProfile(localUser),
    syncPlan(localPlan),
  ]);
}
