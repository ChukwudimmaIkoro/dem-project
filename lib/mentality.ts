import { MentalityCheck } from '@/types';

export const MENTALITY_CHECKS: MentalityCheck[] = [

  // ── Mindfulness ────────────────────────────────────────────────────────────
  {
    id: 'm2',
    type: 'breathing',
    pillar: 'mindfulness',
    protocol: 'CBT',
    emoji: '🌬️',
    title: 'Box Breathing',
    content: 'Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat 5 times. This calms your nervous system and centers your mind.',
    duration: '3 min',
  },
  {
    id: 'm5',
    type: 'meditation',
    pillar: 'mindfulness',
    protocol: 'DBT',
    emoji: '🧘',
    title: 'Body Scan',
    content: 'Close your eyes. Notice tension in your body: your jaw, shoulders, hands. Breathe into each area and let it soften. You\'re safe. You\'re doing great.',
    duration: '5 min',
  },
  {
    id: 'm7',
    type: 'reflection',
    pillar: 'mindfulness',
    protocol: 'CBT',
    emoji: '🔍',
    title: 'Energy Check',
    content: 'How are you feeling right now? What does your body need? There\'s no wrong answer. Honesty with yourself is part of self-care.',
    duration: '2 min',
  },
  {
    id: 'm16',
    type: 'breathing',
    pillar: 'mindfulness',
    protocol: 'DBT',
    emoji: '💨',
    title: 'Mindful Breathing',
    content: 'Count each breath. Inhale 1... exhale 2... up to 10, then start over. When your mind wanders, gently return to 1. No judgment.',
    duration: '3 min',
  },

  // ── Emotional ──────────────────────────────────────────────────────────────
  {
    id: 'm1',
    type: 'affirmation',
    pillar: 'emotional',
    protocol: 'Positive Psychology',
    emoji: '💚',
    title: 'Daily Affirmation',
    content: 'I am capable of achieving my health goals. Every small step I take today brings me closer to the person I want to become.',
    duration: '1 min',
  },
  {
    id: 'm3',
    type: 'reflection',
    pillar: 'emotional',
    protocol: 'CBT',
    emoji: '📖',
    title: 'Progress Reflection',
    content: 'What\'s one thing you did today that moved you forward? It doesn\'t have to be big. Celebrating small wins builds momentum.',
    duration: '2 min',
  },
  {
    id: 'm4',
    type: 'gratitude',
    pillar: 'emotional',
    protocol: 'Positive Psychology',
    emoji: '🙏',
    title: 'Three Good Things',
    content: 'Name three things you\'re grateful for today. They can be as simple as a good meal, a kind word, or your ability to show up for yourself.',
    duration: '2 min',
  },
  {
    id: 'm6',
    type: 'affirmation',
    pillar: 'emotional',
    protocol: 'Positive Psychology',
    emoji: '💪',
    title: 'Strength Reminder',
    content: 'You\'ve overcome challenges before. The fact that you\'re here, trying, is proof of your strength. Keep going.',
    duration: '1 min',
  },

  // ── Physical ───────────────────────────────────────────────────────────────
  {
    id: 'm8',
    type: 'meditation',
    pillar: 'physical',
    protocol: 'Somatic',
    emoji: '😮‍💨',
    title: 'Progressive Muscle Relaxation',
    content: 'Starting from your feet, tense each muscle group for 5 seconds then release. Work your way up: calves, thighs, stomach, hands, shoulders. Feel the difference.',
    duration: '5 min',
  },
  {
    id: 'm9',
    type: 'reflection',
    pillar: 'physical',
    protocol: 'Somatic',
    emoji: '🌅',
    title: 'Morning Stretch',
    content: 'Roll your neck gently side to side. Reach both arms overhead and stretch long. Roll your shoulders back 5 times. Your body has been resting, so say hello to it.',
    duration: '3 min',
  },
  {
    id: 'm10',
    type: 'meditation',
    pillar: 'physical',
    protocol: 'DBT',
    emoji: '🚶',
    title: 'Walking Meditation',
    content: 'Walk slowly for 5 minutes. Feel each footstep. Notice the ground beneath you, the air around you. Walking is enough. You don\'t need to be anywhere but here.',
    duration: '5 min',
  },
  {
    id: 'm11',
    type: 'breathing',
    pillar: 'physical',
    protocol: 'Somatic',
    emoji: '✊',
    title: 'Tension Release',
    content: 'Make a tight fist with both hands, squeezing as hard as you can for 10 seconds. Then release completely. Repeat 3 times. Notice how release feels different from holding.',
    duration: '2 min',
  },

  // ── Sensory ────────────────────────────────────────────────────────────────
  {
    id: 'm12',
    type: 'reflection',
    pillar: 'sensory',
    protocol: 'DBT',
    emoji: '👁️',
    title: '5-4-3-2-1 Grounding',
    content: 'Name 5 things you can see. 4 you can touch. 3 you can hear. 2 you can smell. 1 you can taste. This pulls you into the present moment, where anxiety can\'t follow.',
    duration: '2 min',
  },
  {
    id: 'm13',
    type: 'reflection',
    pillar: 'sensory',
    protocol: 'DBT',
    emoji: '💧',
    title: 'Cold Water Reset',
    content: 'Splash cold water on your face or hold your wrists under cold water for 30 seconds. Feel it completely. Take three slow breaths. Sometimes the body just needs a reset.',
    duration: '1 min',
  },
  {
    id: 'm14',
    type: 'meditation',
    pillar: 'sensory',
    protocol: 'Somatic',
    emoji: '🌿',
    title: 'Nature Focus',
    content: 'Step outside or look through a window. Find one living thing: a tree, a bird, a plant. Watch it for 60 seconds without doing anything else. Let nature remind you to just be.',
    duration: '3 min',
  },
  {
    id: 'm15',
    type: 'reflection',
    pillar: 'sensory',
    protocol: 'CBT',
    emoji: '🫖',
    title: 'Mindful Sip',
    content: 'Pour a glass of water or your favorite drink. Hold it in your hands. Feel the temperature. Take three slow sips, focusing on each one. Taste it. Be here.',
    duration: '2 min',
  },
];

export const getRandomMentalityCheck = (): MentalityCheck => {
  return MENTALITY_CHECKS[Math.floor(Math.random() * MENTALITY_CHECKS.length)];
};

export const getMentalityCheckByType = (type: MentalityCheck['type']): MentalityCheck | undefined => {
  const filtered = MENTALITY_CHECKS.filter(check => check.type === type);
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getMentalityByPillar = (pillar: MentalityCheck['pillar']): MentalityCheck[] => {
  return MENTALITY_CHECKS.filter(check => check.pillar === pillar);
};

export const getMentalityByIds = (ids: string[]): MentalityCheck[] => {
  return MENTALITY_CHECKS.filter(check => ids.includes(check.id));
};
