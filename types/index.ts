// Main Data Types:

export type EnergyLevel = 'low' | 'medium' | 'high';
export type FoodCategory = 'fruit' | 'vegetable' | 'grain' | 'protein' | 'dairy' | 'healthy-fat';

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  emoji: string;
  mealTiming?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]; // Which meals this food is good for
}

export type ExerciseIntensity = 'light' | 'moderate' | 'intense';
export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'rest';
export type MuscleGroup = 'lower' | 'upper' | 'core' | 'full' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  intensity: ExerciseIntensity;
  muscleGroup: MuscleGroup;
  emoji: string;
  description: string;
  duration: string; // e.g. "20 min", "3 sets"
}

export type MentalityType = 'affirmation' | 'breathing' | 'reflection' | 'gratitude' | 'meditation';
export type MentalityPillar = 'mindfulness' | 'physical' | 'emotional' | 'sensory';

export interface MentalityCheck {
  id: string;
  type: MentalityType;
  pillar: MentalityPillar;
  emoji: string;
  title: string;
  content: string;
  duration: string;
}


// User Data:

export interface UserProfile {
  name: string;
  goals: string[];                 // goal IDs selected during onboarding
  selectedFoods: string[];         // food IDs; empty array = no preference (use all foods)
  selectedExercises: string[];     // exercise IDs; empty array = no preference
  selectedMentality: string[];     // mentality check IDs; empty array = no preference
  noFoodPreference?: boolean;      // true = skip food selection, rotate from full database
  noExercisePreference?: boolean;  // true = skip exercise selection
  noMentalityPreference?: boolean; // true = skip mentality selection
  createdAt: string;
}

// Plan Data:

export interface DietPlan {
  focus: string; //ex. "Balanced nutrition"
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snack?: string[];
  };
  macroBalance: {
    fruit: number;
    vegetable: number;
    grain: number;
    protein: number;
  };
}

export interface ExercisePlan {
  focus: string; // e.g., "Light cardio"
  exercises: Exercise[];
  totalDuration: string;
}

export interface MentalityPlan {
  check: MentalityCheck;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  energyLevel: EnergyLevel;
  energyLocked: boolean;   // true once all 3 pillars are completed — energy can't be changed
  diet: DietPlan;
  exercise: ExercisePlan;
  mentality: MentalityPlan;
  completed: {
    diet: boolean;
    exercise: boolean;
    mentality: boolean;
  };
}

export interface ThreeDayPlan {
  id: string;
  createdAt: string;
  startDate: string;                      // when the streak clock started (used for real-time day calc)
  planLength: 3 | 5 | 7 | 14 | 30;       // number of days in this streak
  days: DayPlan[];
  currentDay: number;
  streak: number;
  historicalStreak: number;               // total completed plan cycles
  carryOverStreak: number;                // total days carried over from all previous plans (for display)
  dummyCurrency: number;                  // placeholder for future monetization
}

// App State:

export interface AppState {
  user: UserProfile | null;
  currentPlan: ThreeDayPlan | null;
  hasCompletedOnboarding: boolean;
}