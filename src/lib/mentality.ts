import { MentalityCheck } from '@/types';

export const MENTALITY_CHECKS: MentalityCheck[] = [
  {
    id: 'm1',
    type: 'affirmation',
    title: 'Daily Affirmation',
    content: 'I am capable of achieving my health goals. Every small step I take today brings me closer to the person I want to become.',
    duration: '1 min'
  },
  {
    id: 'm2',
    type: 'breathing',
    title: 'Box Breathing',
    content: 'Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat 5 times. This calms your nervous system and centers your mind.',
    duration: '3 min'
  },
  {
    id: 'm3',
    type: 'reflection',
    title: 'Progress Reflection',
    content: 'What\'s one thing you did today that moved you forward? It doesn\'t have to be big - celebrating small wins builds momentum.',
    duration: '2 min'
  },
  {
    id: 'm4',
    type: 'gratitude',
    title: 'Three Good Things',
    content: 'Name three things you\'re grateful for today. They can be as simple as a good meal, a kind word, or your ability to show up for yourself.',
    duration: '2 min'
  },
  {
    id: 'm5',
    type: 'meditation',
    title: 'Body Scan',
    content: 'Close your eyes. Notice tension in your body - your jaw, shoulders, hands. Breathe into each area and let it soften. You\'re safe. You\'re doing great.',
    duration: '5 min'
  },
  {
    id: 'm6',
    type: 'affirmation',
    title: 'Strength Reminder',
    content: 'You\'ve overcome challenges before. The fact that you\'re here, trying, is proof of your strength. Keep going.',
    duration: '1 min'
  },
  {
    id: 'm7',
    type: 'reflection',
    title: 'Energy Check',
    content: 'How are you feeling right now? What does your body need? There\'s no wrong answer - honesty with yourself is part of self-care.',
    duration: '2 min'
  },
];

// Get random mentality check
export const getRandomMentalityCheck = (): MentalityCheck => {
  return MENTALITY_CHECKS[Math.floor(Math.random() * MENTALITY_CHECKS.length)];
};

// Get mentality check by type
export const getMentalityCheckByType = (type: MentalityCheck['type']): MentalityCheck | undefined => {
  const filtered = MENTALITY_CHECKS.filter(check => check.type === type);
  return filtered[Math.floor(Math.random() * filtered.length)];
};