import { 
  ThreeDayPlan, 
  DayPlan, 
  EnergyLevel, 
  UserProfile,
  DietPlan,
  ExercisePlan,
  MentalityPlan
} from '@/types';
import { getFoodsByIds, FOODS } from './foods';
import { EXERCISES, getExercisesByIntensity, getExercisesByIds } from './exercises';
import { MENTALITY_CHECKS, getRandomMentalityCheck, getMentalityCheckByType } from './mentality';

/**
 * ENERGY SCALING LOGIC
 * This is the differentiator feature
 */

// Map energy level to exercise intensity
const ENERGY_TO_INTENSITY = {
  low: 'light' as const,
  medium: 'moderate' as const,
  high: 'intense' as const,
};

// Map energy level to meal complexity
const ENERGY_TO_MEAL_STYLE = {
  low: 'simple', // Quick, easy meals
  medium: 'balanced', // Normal meal prep
  high: 'optimal', // Full macro-optimized meals
};

/**
 * Generate diet plan based on user's food preferences and energy level
 */
function generateDietPlan(userFoods: string[], energyLevel: EnergyLevel, dayNumber: number): DietPlan {
  // Empty selectedFoods = "no preference" mode — use the full food database
  const selectedFoods = userFoods.length > 0 ? getFoodsByIds(userFoods) : FOODS;
  
  // Categorize user's selected foods by meal timing
  const breakfastFoods = selectedFoods.filter(f => 
    !f.mealTiming || f.mealTiming.includes('breakfast')
  );
  const lunchDinnerFoods = selectedFoods.filter(f => 
    !f.mealTiming || f.mealTiming.includes('lunch') || f.mealTiming.includes('dinner')
  );
  const snackFoods = selectedFoods.filter(f => 
    !f.mealTiming || f.mealTiming.includes('snack')
  );

  // Fisher-Yates shuffle — unbiased random selection
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pickRandom = <T,>(arr: T[], count: number): T[] => shuffle(arr).slice(0, count);

  // Energy-based meal planning
  let mealComplexity = ENERGY_TO_MEAL_STYLE[energyLevel];
  
  const meals = {
    breakfast: [] as string[],
    lunch: [] as string[],
    dinner: [] as string[],
    snack: [] as string[],
  };

  if (energyLevel === 'low') {
    // Simple, easy meals
    meals.breakfast = pickRandom(breakfastFoods, Math.min(2, breakfastFoods.length)).map(f => f.name);
    meals.lunch = pickRandom(lunchDinnerFoods, Math.min(3, lunchDinnerFoods.length)).map(f => f.name);
    meals.dinner = pickRandom(lunchDinnerFoods, Math.min(2, lunchDinnerFoods.length)).map(f => f.name);
    meals.snack = pickRandom(snackFoods, Math.min(1, snackFoods.length)).map(f => f.name);
  } else if (energyLevel === 'medium') {
    // Balanced meals
    meals.breakfast = pickRandom(breakfastFoods, Math.min(3, breakfastFoods.length)).map(f => f.name);
    meals.lunch = pickRandom(lunchDinnerFoods, Math.min(4, lunchDinnerFoods.length)).map(f => f.name);
    meals.dinner = pickRandom(lunchDinnerFoods, Math.min(4, lunchDinnerFoods.length)).map(f => f.name);
    meals.snack = pickRandom(snackFoods, Math.min(1, snackFoods.length)).map(f => f.name);
  } else {
    // High energy - optimal macro balance
    meals.breakfast = pickRandom(breakfastFoods, Math.min(4, breakfastFoods.length)).map(f => f.name);
    meals.lunch = pickRandom(lunchDinnerFoods, Math.min(5, lunchDinnerFoods.length)).map(f => f.name);
    meals.dinner = pickRandom(lunchDinnerFoods, Math.min(5, lunchDinnerFoods.length)).map(f => f.name);
    meals.snack = pickRandom(snackFoods, Math.min(2, snackFoods.length)).map(f => f.name);
  }

  return {
    focus: energyLevel === 'low' ? 'Simple, satisfying meals' : 
           energyLevel === 'medium' ? 'Balanced nutrition' : 
           'Optimized macro balance',
    meals,
    macroBalance: {
      fruit: 18,
      vegetable: 32,
      grain: 25,
      protein: 25,
    },
  };
}

/**
 * Generate exercise plan based on energy level and user preferences
 */
function generateExercisePlan(energyLevel: EnergyLevel, dayNumber: number, userExercises: string[]): ExercisePlan {
  const intensity = ENERGY_TO_INTENSITY[energyLevel];

  // Build pool: user's selected exercises filtered by intensity, falling back as needed
  let pool;
  if (userExercises.length === 0) {
    pool = getExercisesByIntensity(intensity);
  } else {
    const userPool = getExercisesByIds(userExercises);
    pool = userPool.filter(ex => ex.intensity === intensity);
    if (pool.length === 0) pool = userPool;               // no matching intensity — use all user picks
    if (pool.length === 0) pool = getExercisesByIntensity(intensity); // final fallback
  }

  // Pick 1–2 exercises based on day progression (Fisher-Yates)
  const selectedCount = dayNumber === 1 ? 1 : dayNumber === 2 ? 1 : 2;
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected = shuffled.slice(0, Math.min(selectedCount, shuffled.length));

  return {
    focus: energyLevel === 'low' ? 'Light movement' :
           energyLevel === 'medium' ? 'Moderate activity' :
           'Challenging workout',
    exercises: selected,
    totalDuration: selected.reduce((sum, ex) => {
      const mins = parseInt(ex.duration);
      return sum + (isNaN(mins) ? 0 : mins);
    }, 0) + ' min',
  };
}

/**
 * Generate mentality check based on user preferences
 */
function generateMentalityPlan(dayNumber: number, userMentality: string[]): MentalityPlan {
  if (userMentality.length === 0) {
    // No preference — rotate through affirmation/breathing/reflection by day
    const types = ['affirmation', 'breathing', 'reflection'] as const;
    const check = getMentalityCheckByType(types[(dayNumber - 1) % 3]) || getRandomMentalityCheck();
    return { check };
  }

  // Pick from user's selected checks, rotating by day number
  const userPool = MENTALITY_CHECKS.filter(m => userMentality.includes(m.id));
  const shuffled = [...userPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const check = shuffled[(dayNumber - 1) % shuffled.length] ?? getRandomMentalityCheck();
  return { check };
}

/**
 * MAIN FUNCTION: Generate a plan of any supported length
 */
export function generatePlan(
  user: UserProfile,
  planLength: 3 | 5 | 7 | 14 | 30 = 3,
  energyLevels?: EnergyLevel[],
): ThreeDayPlan {
  const now    = new Date();
  const levels = energyLevels ?? [];

  const days: DayPlan[] = Array.from({ length: planLength }, (_, i) => {
    const dayNumber   = i + 1;
    const energy: EnergyLevel = levels[i] ?? 'medium';
    return {
      dayNumber,
      date:         new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      energyLevel:  energy,
      energyLocked: false,
      diet:         generateDietPlan(user.selectedFoods, energy, dayNumber),
      exercise:     generateExercisePlan(energy, dayNumber, user.selectedExercises ?? []),
      mentality:    generateMentalityPlan(dayNumber, user.selectedMentality ?? []),
      completed:    { diet: false, exercise: false, mentality: false },
    };
  });

  return {
    id:               typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `plan-${Date.now()}`,
    createdAt:        now.toISOString(),
    startDate:        now.toISOString(),
    planLength,
    days,
    currentDay:       1,
    streak:           0,
    historicalStreak: 0,
    carryOverStreak:  0,
    dummyCurrency:    0,
  };
}

/**
 * Backward-compatible alias for 3-day plan generation
 */
export function generateThreeDayPlan(
  user: UserProfile,
  energyLevels?: EnergyLevel[],
): ThreeDayPlan {
  return generatePlan(user, 3, energyLevels);
}

/**
 * Regenerate only the diet + exercise for one day when energy changes.
 * Preserves all other day state (completed, mentality, energyLocked).
 */
export function regenerateDayForEnergy(
  plan: ThreeDayPlan,
  dayIdx: number,
  energy: EnergyLevel,
  user: UserProfile,
): ThreeDayPlan {
  const updated = { ...plan, days: [...plan.days] };
  const dayNumber = dayIdx + 1;
  updated.days[dayIdx] = {
    ...updated.days[dayIdx],
    energyLevel: energy,
    diet:        generateDietPlan(user.selectedFoods, energy, dayNumber),
    exercise:    generateExercisePlan(energy, dayNumber, user.selectedExercises ?? []),
  };
  return updated;
}

/**
 * Return the 0-based index of the currently active day based on real calendar time.
 * Compares calendar days (ignores time-of-day). Clamps to [0, days.length - 1].
 */
export function getActiveDayIndex(plan: ThreeDayPlan): number {
  const startStr = plan.startDate ?? plan.createdAt;
  const start    = new Date(startStr);
  const today    = new Date();
  // Strip time component for calendar-day comparison
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff     = Math.floor((todayDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(0, diff), plan.days.length - 1);
}

/**
 * Shuffle meals for a single day — reuses same pool/energy, just re-randomizes picks.
 * Called when the user clicks the dice icon.
 */
export function shuffleDietMeals(userFoods: string[], energyLevel: EnergyLevel, dayNumber: number): DietPlan {
  return generateDietPlan(userFoods, energyLevel, dayNumber);
}

/**
 * Check if a day is fully completed
 */
export function isDayComplete(day: DayPlan): boolean {
  return day.completed.diet && day.completed.exercise && day.completed.mentality;
}

/**
 * Calculate current streak.
 * Counts backward from the most recently relevant day so a gray (missed) day
 * breaks the chain but completing later days rebuilds the streak from scratch.
 *
 * - If the active day is done, count backward from it (inclusive).
 * - If the active day is still in progress, count backward from the previous day.
 * - A missed (gray) day encountered while counting backward stops the count.
 */
export function calculateStreak(plan: ThreeDayPlan, activeDayIdx?: number): number {
  const activeIdx = activeDayIdx ?? (plan.days.length - 1);
  // Start from activeIdx if it's complete, otherwise from the day before it
  const startIdx = isDayComplete(plan.days[activeIdx]) ? activeIdx : activeIdx - 1;
  if (startIdx < 0) return 0;
  let streak = 0;
  for (let i = startIdx; i >= 0; i--) {
    if (isDayComplete(plan.days[i])) streak++;
    else break;
  }
  return streak;
}