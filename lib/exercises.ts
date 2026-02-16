import { Exercise } from '@/types';

export const EXERCISES: Exercise[] = [
    //TODO: Scale later, pull in from data source, add little animations?

  // Light intensity
  {
    id: 'ex1',
    name: 'Easy Walk',
    type: 'cardio',
    intensity: 'light',
    description: 'A gentle 20-minute walk around your neighborhood',
    duration: '20 min'
  },
  {
    id: 'ex2',
    name: 'Stretching',
    type: 'flexibility',
    intensity: 'light',
    description: 'Full body stretching routine',
    duration: '15 min'
  },
  {
    id: 'ex3',
    name: 'Yoga Flow',
    type: 'flexibility',
    intensity: 'light',
    description: 'Gentle yoga for mobility and relaxation',
    duration: '20 min'
  },

  // Moderate intensity
  {
    id: 'ex4',
    name: 'Brisk Walk',
    type: 'cardio',
    intensity: 'moderate',
    description: 'Power walk at a challenging pace',
    duration: '30 min'
  },
  {
    id: 'ex5',
    name: 'Bodyweight Circuit',
    type: 'strength',
    intensity: 'moderate',
    description: 'Push-ups, squats, planks - 3 rounds',
    duration: '25 min'
  },
  {
    id: 'ex6',
    name: 'Light Jog',
    type: 'cardio',
    intensity: 'moderate',
    description: 'Easy-paced jogging with walk breaks',
    duration: '25 min'
  },
  {
    id: 'ex7',
    name: 'Bike Ride',
    type: 'cardio',
    intensity: 'moderate',
    description: 'Cycling at a steady pace',
    duration: '30 min'
  },
  {
    id: 'ex8',
    name: 'Core Workout',
    type: 'strength',
    intensity: 'moderate',
    description: 'Planks, crunches, leg raises - 3 sets',
    duration: '20 min'
  },

  // Intense
  {
    id: 'ex9',
    name: 'HIIT Cardio',
    type: 'cardio',
    intensity: 'intense',
    description: 'High-intensity intervals with short rest',
    duration: '20 min'
  },
  {
    id: 'ex10',
    name: 'Strength Training',
    type: 'strength',
    intensity: 'intense',
    description: 'Heavy compound lifts - squats, deadlifts, bench',
    duration: '45 min'
  },
  {
    id: 'ex11',
    name: 'Running',
    type: 'cardio',
    intensity: 'intense',
    description: 'Sustained running at challenging pace',
    duration: '30 min'
  },
  {
    id: 'ex12',
    name: 'Upper Body Strength',
    type: 'strength',
    intensity: 'intense',
    description: 'Push-ups, pull-ups, dips - 4 sets each',
    duration: '40 min'
  },
  {
    id: 'ex13',
    name: 'Lower Body Strength',
    type: 'strength',
    intensity: 'intense',
    description: 'Squats, lunges, calf raises - 4 sets each',
    duration: '40 min'
  },

  // Rest day
  {
    id: 'ex14',
    name: 'Active Recovery',
    type: 'rest',
    intensity: 'light',
    description: 'Light movement and stretching',
    duration: '15 min'
  },
];

// Get exercises by intensity
export const getExercisesByIntensity = (intensity: Exercise['intensity']): Exercise[] => {
  return EXERCISES.filter(ex => ex.intensity === intensity);
};

// Get random exercise by type and intensity
export const getRandomExercise = (
  type: Exercise['type'],
  intensity: Exercise['intensity']
): Exercise | undefined => {
  const filtered = EXERCISES.filter(ex => ex.type === type && ex.intensity === intensity);
  return filtered[Math.floor(Math.random() * filtered.length)];
};