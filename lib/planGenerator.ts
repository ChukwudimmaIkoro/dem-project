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
import { EXERCISES, getExercisesByIntensity } from './exercises';
import { getRandomMentalityCheck, getMentalityCheckByType } from './mentality';

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
  const selectedFoods = getFoodsByIds(userFoods);
  
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

  // Helper to pick random items
  const pickRandom = <T,>(arr: T[], count: number): T[] => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

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
 * Generate exercise plan based on energy level
 */
function generateExercisePlan(energyLevel: EnergyLevel, dayNumber: number): ExercisePlan {
  const intensity = ENERGY_TO_INTENSITY[energyLevel];
  const exercises = getExercisesByIntensity(intensity);
  
  // Pick 1-2 exercises based on day progression
  const selectedCount = dayNumber === 1 ? 1 : dayNumber === 2 ? 1 : 2;
  const selected = exercises
    .sort(() => 0.5 - Math.random())
    .slice(0, selectedCount);

  return {
    focus: energyLevel === 'low' ? 'Light movement' :
           energyLevel === 'medium' ? 'Moderate activity' :
           'Challenging workout',
    exercises: selected,
    totalDuration: selected.reduce((sum, ex) => {
      const mins = parseInt(ex.duration);
      return sum + mins;
    }, 0) + ' min',
  };
}

/**
 * Generate mentality check
 */
function generateMentalityPlan(dayNumber: number): MentalityPlan {
  // Day 1: affirmation, Day 2: breathing, Day 3: reflection
  const types = ['affirmation', 'breathing', 'reflection'] as const;
  const check = getMentalityCheckByType(types[dayNumber - 1]) || getRandomMentalityCheck();
  
  return { check };
}

/**
 * MAIN FUNCTION: Generate complete 3-day plan
 */
export function generateThreeDayPlan(user: UserProfile, energyLevels?: [EnergyLevel, EnergyLevel, EnergyLevel]): ThreeDayPlan {
  // Default to medium energy if not specified
  const levels: [EnergyLevel, EnergyLevel, EnergyLevel] = energyLevels || ['medium', 'medium', 'medium'];
  
  const now = new Date();
  
  const days: [DayPlan, DayPlan, DayPlan] = [
    {
      dayNumber: 1,
      date: new Date(now.getTime() + 0 * 24 * 60 * 60 * 1000).toISOString(),
      energyLevel: levels[0],
      diet: generateDietPlan(user.selectedFoods, levels[0], 1),
      exercise: generateExercisePlan(levels[0], 1),
      mentality: generateMentalityPlan(1),
      completed: {
        diet: false,
        exercise: false,
        mentality: false,
      },
    },
    {
      dayNumber: 2,
      date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      energyLevel: levels[1],
      diet: generateDietPlan(user.selectedFoods, levels[1], 2),
      exercise: generateExercisePlan(levels[1], 2),
      mentality: generateMentalityPlan(2),
      completed: {
        diet: false,
        exercise: false,
        mentality: false,
      },
    },
    {
      dayNumber: 3,
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      energyLevel: levels[2],
      diet: generateDietPlan(user.selectedFoods, levels[2], 3),
      exercise: generateExercisePlan(levels[2], 3),
      mentality: generateMentalityPlan(3),
      completed: {
        diet: false,
        exercise: false,
        mentality: false,
      },
    },
  ];

  return {
    id: `plan-${Date.now()}`,
    createdAt: now.toISOString(),
    days,
    currentDay: 1,
    streak: 0,
  };
}

/**
 * Check if a day is fully completed
 */
export function isDayComplete(day: DayPlan): boolean {
  return day.completed.diet && day.completed.exercise && day.completed.mentality;
}

/**
 * Calculate current streak
 */
export function calculateStreak(plan: ThreeDayPlan): number {
  let streak = 0;
  for (const day of plan.days) {
    if (isDayComplete(day)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}