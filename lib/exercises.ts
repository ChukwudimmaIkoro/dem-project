import { Exercise } from '@/types';

export const EXERCISES: Exercise[] = [

  // ── Cardio ─────────────────────────────────────────────────────────────────
  {
    id: 'ex1',
    name: 'Easy Walk',
    type: 'cardio',
    intensity: 'light',
    muscleGroup: 'cardio',
    emoji: '🚶',
    description: 'A gentle 20-minute walk around your neighborhood',
    duration: '20 min',
  },
  {
    id: 'ex4',
    name: 'Brisk Walk',
    type: 'cardio',
    intensity: 'moderate',
    muscleGroup: 'cardio',
    emoji: '🏃',
    description: 'Power walk at a challenging pace',
    duration: '30 min',
  },
  {
    id: 'ex6',
    name: 'Light Jog',
    type: 'cardio',
    intensity: 'moderate',
    muscleGroup: 'cardio',
    emoji: '🏃',
    description: 'Easy-paced jogging with walk breaks',
    duration: '25 min',
  },
  {
    id: 'ex7',
    name: 'Bike Ride',
    type: 'cardio',
    intensity: 'moderate',
    muscleGroup: 'cardio',
    emoji: '🚴',
    description: 'Cycling at a steady pace',
    duration: '30 min',
  },
  {
    id: 'ex9',
    name: 'HIIT Cardio',
    type: 'cardio',
    intensity: 'intense',
    muscleGroup: 'cardio',
    emoji: '⚡',
    description: 'High-intensity intervals with short rest',
    duration: '20 min',
  },
  {
    id: 'ex11',
    name: 'Running',
    type: 'cardio',
    intensity: 'intense',
    muscleGroup: 'cardio',
    emoji: '🏃',
    description: 'Sustained running at challenging pace',
    duration: '30 min',
  },

  // ── Full Body ───────────────────────────────────────────────────────────────
  {
    id: 'ex2',
    name: 'Stretching',
    type: 'flexibility',
    intensity: 'light',
    muscleGroup: 'full',
    emoji: '🧘',
    description: 'Full body stretching routine',
    duration: '15 min',
  },
  {
    id: 'ex3',
    name: 'Yoga Flow',
    type: 'flexibility',
    intensity: 'light',
    muscleGroup: 'full',
    emoji: '🧘',
    description: 'Gentle yoga for mobility and relaxation',
    duration: '20 min',
  },
  {
    id: 'ex5',
    name: 'Bodyweight Circuit',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'full',
    emoji: '💥',
    description: 'Push-ups, squats, planks: 3 rounds',
    duration: '25 min',
  },
  {
    id: 'ex10',
    name: 'Strength Training',
    type: 'strength',
    intensity: 'intense',
    muscleGroup: 'full',
    emoji: '🏋️',
    description: 'Heavy compound lifts: squats, deadlifts, bench',
    duration: '45 min',
  },
  {
    id: 'ex14',
    name: 'Active Recovery',
    type: 'rest',
    intensity: 'light',
    muscleGroup: 'full',
    emoji: '😌',
    description: 'Light movement and stretching',
    duration: '15 min',
  },

  // ── Core ───────────────────────────────────────────────────────────────────
  {
    id: 'ex8',
    name: 'Core Workout',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'core',
    emoji: '🔥',
    description: 'Planks, crunches, leg raises: 3 sets',
    duration: '20 min',
  },
  {
    id: 'ex15',
    name: 'Plank Hold',
    type: 'strength',
    intensity: 'light',
    muscleGroup: 'core',
    emoji: '🧱',
    description: 'Isometric plank hold, 3 sets of 30 to 60 seconds',
    duration: '10 min',
  },
  {
    id: 'ex16',
    name: 'Bicycle Crunches',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'core',
    emoji: '🚴',
    description: 'Alternating elbow-to-knee crunches, 3 sets of 20',
    duration: '10 min',
  },
  {
    id: 'ex17',
    name: 'Dead Bug',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'core',
    emoji: '🐛',
    description: 'Alternating arm/leg extension on your back, 3 sets of 10',
    duration: '10 min',
  },
  {
    id: 'ex18',
    name: 'Leg Raises',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'core',
    emoji: '🦵',
    description: 'Straight-leg raises lying down, 3 sets of 15',
    duration: '10 min',
  },

  // ── Upper Body ─────────────────────────────────────────────────────────────
  {
    id: 'ex12',
    name: 'Upper Body Strength',
    type: 'strength',
    intensity: 'intense',
    muscleGroup: 'upper',
    emoji: '💪',
    description: 'Push-ups, pull-ups, dips: 4 sets each',
    duration: '40 min',
  },
  {
    id: 'ex19',
    name: 'Push-ups',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'upper',
    emoji: '💪',
    description: 'Classic push-ups, 3 sets of 10 to 15',
    duration: '10 min',
  },
  {
    id: 'ex20',
    name: 'Pike Push-ups',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'upper',
    emoji: '🔺',
    description: 'Pike position push-ups for shoulders, 3 sets of 10',
    duration: '10 min',
  },
  {
    id: 'ex21',
    name: 'Chair Dips',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'upper',
    emoji: '🪑',
    description: 'Tricep dips using a sturdy chair, 3 sets of 12',
    duration: '10 min',
  },
  {
    id: 'ex22',
    name: 'Wall Push-ups',
    type: 'strength',
    intensity: 'light',
    muscleGroup: 'upper',
    emoji: '🧱',
    description: 'Standing push-ups against a wall, great for beginners',
    duration: '10 min',
  },

  // ── Lower Body ─────────────────────────────────────────────────────────────
  {
    id: 'ex13',
    name: 'Lower Body Strength',
    type: 'strength',
    intensity: 'intense',
    muscleGroup: 'lower',
    emoji: '🦵',
    description: 'Squats, lunges, calf raises: 4 sets each',
    duration: '40 min',
  },
  {
    id: 'ex23',
    name: 'Squats',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'lower',
    emoji: '🏋️',
    description: 'Bodyweight squats, 3 sets of 15',
    duration: '10 min',
  },
  {
    id: 'ex24',
    name: 'Lunges',
    type: 'strength',
    intensity: 'moderate',
    muscleGroup: 'lower',
    emoji: '🦵',
    description: 'Walking or stationary lunges, 3 sets of 10 per leg',
    duration: '10 min',
  },
  {
    id: 'ex25',
    name: 'Glute Bridge',
    type: 'strength',
    intensity: 'light',
    muscleGroup: 'lower',
    emoji: '🌉',
    description: 'Hip thrust from the floor, 3 sets of 15',
    duration: '10 min',
  },
  {
    id: 'ex26',
    name: 'Calf Raises',
    type: 'strength',
    intensity: 'light',
    muscleGroup: 'lower',
    emoji: '🦶',
    description: 'Standing calf raises, 3 sets of 20',
    duration: '8 min',
  },
];

// Get exercises by intensity
export const getExercisesByIntensity = (intensity: Exercise['intensity']): Exercise[] => {
  return EXERCISES.filter(ex => ex.intensity === intensity);
};

// Get exercises by muscle group
export const getExercisesByMuscleGroup = (muscleGroup: Exercise['muscleGroup']): Exercise[] => {
  return EXERCISES.filter(ex => ex.muscleGroup === muscleGroup);
};

// Get exercises by IDs
export const getExercisesByIds = (ids: string[]): Exercise[] => {
  return EXERCISES.filter(ex => ids.includes(ex.id));
};

// Get random exercise by type and intensity
export const getRandomExercise = (
  type: Exercise['type'],
  intensity: Exercise['intensity']
): Exercise | undefined => {
  const filtered = EXERCISES.filter(ex => ex.type === type && ex.intensity === intensity);
  return filtered[Math.floor(Math.random() * filtered.length)];
};
