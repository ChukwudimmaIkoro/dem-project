// Supabase storage layer. Mirrors lib/storage.ts interface for authenticated users.

import { supabase } from './supabase';
import { UserProfile, ThreeDayPlan } from '@/types';
import {
  CachedRecipe, CachedInsight, CachedExerciseCoach,
  saveUserProfile as lsSaveUserProfile,
  saveCurrentPlan as lsSaveCurrentPlan,
} from './storage';
import { PantryItem, savePantry } from './pantry';
import { getTreatsCloudPayload, restoreTreatsFromCloud, TREATS_CLOUD_KEY } from './thinkyTreats';

// User profile

export async function syncUserProfile(user: UserProfile): Promise<void> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return;

  await supabase.from('user_profiles').upsert({
    id:                             authUser.id,
    name:                           user.name,
    goals:                          user.goals ?? [],
    selected_foods:                 user.selectedFoods ?? [],
    selected_exercises:             user.selectedExercises ?? [],
    selected_mentality:             user.selectedMentality ?? [],
    no_food_preference:             user.noFoodPreference ?? false,
    no_exercise_preference:         user.noExercisePreference ?? false,
    no_mentality_preference:        user.noMentalityPreference ?? false,
    longest_streak:                 user.longestStreak ?? 0,
    dem_plus_habit:                 user.demPlusHabit ?? null,
    mascot_items:                   user.mascotItems ?? [],
    subscription_tier:              user.subscriptionTier ?? 'basic',
    total_days_completed:           user.totalDaysCompleted ?? 0,
    total_recipes_generated:        user.totalRecipesGenerated ?? 0,
    total_exercise_tips_generated:  user.totalExerciseTipsGenerated ?? 0,
    created_at:                     user.createdAt,
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
    name:                        data.name,
    goals:                       data.goals ?? [],
    selectedFoods:               data.selected_foods ?? [],
    selectedExercises:           data.selected_exercises ?? [],
    selectedMentality:           data.selected_mentality ?? [],
    noFoodPreference:            data.no_food_preference ?? false,
    noExercisePreference:        data.no_exercise_preference ?? false,
    noMentalityPreference:       data.no_mentality_preference ?? false,
    longestStreak:               data.longest_streak ?? 0,
    demPlusHabit:                data.dem_plus_habit ?? undefined,
    mascotItems:                 data.mascot_items ?? [],
    subscriptionTier:            data.subscription_tier ?? 'basic',
    totalDaysCompleted:          data.total_days_completed ?? 0,
    totalRecipesGenerated:       data.total_recipes_generated ?? 0,
    totalExerciseTipsGenerated:  data.total_exercise_tips_generated ?? 0,
    createdAt:                   data.created_at,
  };
}

// Plan

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

// AI cache

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

// Pantry

export async function syncPantry(items: PantryItem[]): Promise<void> {
  return setCachedValue('pantry-items', { items });
}

export async function loadPantryFromCloud(): Promise<PantryItem[] | null> {
  const result = await getCachedValue<{ items: PantryItem[] }>('pantry-items');
  return result?.items ?? null;
}

// Thinky Treats usage (synced so treats don't reset on new device/rebuild)

export async function syncTreats(): Promise<void> {
  return setCachedValue(TREATS_CLOUD_KEY, getTreatsCloudPayload());
}

export async function loadTreatsFromCloud(): Promise<{ date: string; used: number } | null> {
  return getCachedValue<{ date: string; used: number }>(TREATS_CLOUD_KEY);
}

// Migration: push localStorage data to Supabase on first sign-in
export async function migrateLocalDataToSupabase(
  localUser: UserProfile,
  localPlan: ThreeDayPlan,
): Promise<void> {
  await Promise.all([
    syncUserProfile(localUser),
    syncPlan(localPlan),
  ]);
}
