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

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  intensity: ExerciseIntensity;
  description: string;
  duration: string; //ex "20 min", "3 sets"
}

export type MentalityType = 'affirmation' | 'breathing' | 'reflection' | 'gratitude' | 'meditation';

export interface MentalityCheck {
  id: string;
  type: MentalityType;
  title: string;
  content: string;
  duration: string;
}


// User Data:

export interface UserProfile {
  name: string;
  selectedFoods: string[]; //retursn food IDs
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

//TODO: Later, update for 5 day plan, 1-2 week plans, etc.
export interface DayPlan {
  dayNumber: 1 | 2 | 3;
  date: string;
  energyLevel: EnergyLevel;
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
  days: [DayPlan, DayPlan, DayPlan];
  currentDay: 1 | 2 | 3;
  streak: number;
}

// App State:

export interface AppState {
  user: UserProfile | null;
  currentPlan: ThreeDayPlan | null;
  hasCompletedOnboarding: boolean;
}