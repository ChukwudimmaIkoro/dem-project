'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types';
import { FOODS } from '@/lib/foods';
import { EXERCISES } from '@/lib/exercises';
import { MENTALITY_CHECKS } from '@/lib/mentality';
import { generateThreeDayPlan } from '@/lib/planGenerator';
import { saveUserProfile, saveCurrentPlan } from '@/lib/storage';
import { syncUserProfile, syncPlan } from '@/lib/supabaseStorage';
import { Button } from './Button';
import { Card } from './Card';
import { Check } from 'lucide-react';
import FoodPieChart from './FoodPieChart';
import Mascot from './Mascot';
import FloatingMascot from './FloatingMascot';

interface OnboardingFlowProps {
  userName: string;   // from auth metadata — no name entry step needed
  onComplete: () => void;
}

const TOTAL_STEPS = 4;

const STEP_NAMES = ['Your Goals', 'Your Foods', 'Your Exercises', 'Your Mind'];

const GOAL_OPTIONS = [
  { id: 'routine',  emoji: '🔄', label: 'Start & maintain a routine' },
  { id: 'eat',      emoji: '🥗', label: 'Eat better' },
  { id: 'exercise', emoji: '💪', label: 'Exercise more' },
  { id: 'mind',     emoji: '🧘', label: 'Rebalance my mind' },
  { id: 'recover',  emoji: '💊', label: 'Recover & heal' },
  { id: 'all',      emoji: '✨', label: 'All of the above' },
];

const FOOD_CATEGORIES = {
  fruit:         '🍎 Fruits',
  vegetable:     '🥦 Vegetables',
  grain:         '🌾 Grains',
  protein:       '🍗 Proteins',
  'healthy-fat': '🥑 Healthy Fats',
} as const;

const EXERCISE_GROUPS = {
  lower:  '🦵 Lower Body',
  upper:  '💪 Upper Body',
  core:   '🔥 Core',
  full:   '💥 Full Body',
  cardio: '🏃 Cardio',
} as const;

const MENTALITY_PILLARS = {
  mindfulness: '🧘 Mindfulness',
  physical:    '😮‍💨 Physical',
  emotional:   '💚 Emotional',
  sensory:     '👁️ Sensory',
} as const;

// ── Reusable selection grid ─────────────────────────────────────────────────

interface SelectionItem { id: string; emoji: string; name: string; }

function SelectionGrid({ items, selected, onToggle }: {
  items: SelectionItem[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(item => {
        const isSelected = selected.includes(item.id);
        return (
          <motion.button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="relative px-3 py-2.5 rounded-xl border-2 text-left overflow-hidden"
            style={{
              borderColor: isSelected ? '#22c55e' : '#e5e7eb',
              background:  isSelected ? '#f0fdf4' : 'white',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-lg flex-shrink-0">{item.emoji}</span>
                <span className="text-sm font-semibold text-gray-800 truncate">{item.name}</span>
              </div>
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="flex-shrink-0 ml-1"
                  >
                    <Check className="w-4 h-4 text-dem-green-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function OnboardingFlow({ userName, onComplete }: OnboardingFlowProps) {
  const [step,              setStep]              = useState(1);
  const [isCreating,        setIsCreating]        = useState(false);
  const [selectedGoals,     setSelectedGoals]     = useState<string[]>([]);
  const [selectedFoods,     setSelectedFoods]     = useState<string[]>([]);
  const [noFoodPref,        setNoFoodPref]        = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [noExercisePref,    setNoExercisePref]    = useState(false);
  const [selectedMentality, setSelectedMentality] = useState<string[]>([]);
  const [noMentalityPref,   setNoMentalityPref]   = useState(false);

  const displayName = userName.trim() || 'Friend';

  // Pre-group items
  const foodsByCategory = {
    fruit:         FOODS.filter(f => f.category === 'fruit'),
    vegetable:     FOODS.filter(f => f.category === 'vegetable'),
    grain:         FOODS.filter(f => f.category === 'grain'),
    protein:       FOODS.filter(f => f.category === 'protein'),
    'healthy-fat': FOODS.filter(f => f.category === 'healthy-fat'),
  };
  const exercisesByGroup = {
    lower:  EXERCISES.filter(e => e.muscleGroup === 'lower'),
    upper:  EXERCISES.filter(e => e.muscleGroup === 'upper'),
    core:   EXERCISES.filter(e => e.muscleGroup === 'core'),
    full:   EXERCISES.filter(e => e.muscleGroup === 'full'),
    cardio: EXERCISES.filter(e => e.muscleGroup === 'cardio'),
  };
  const mentalityByPillar = {
    mindfulness: MENTALITY_CHECKS.filter(m => m.pillar === 'mindfulness'),
    physical:    MENTALITY_CHECKS.filter(m => m.pillar === 'physical'),
    emotional:   MENTALITY_CHECKS.filter(m => m.pillar === 'emotional'),
    sensory:     MENTALITY_CHECKS.filter(m => m.pillar === 'sensory'),
  };

  // Toggle helpers
  const toggleGoal = (goalId: string) => {
    if (goalId === 'all') {
      setSelectedGoals(prev => prev.includes('all') ? [] : GOAL_OPTIONS.map(g => g.id));
    } else {
      setSelectedGoals(prev => {
        const without = prev.filter(id => id !== 'all');
        return without.includes(goalId) ? without.filter(id => id !== goalId) : [...without, goalId];
      });
    }
  };

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (id: string) => setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleComplete = () => {
    const user: UserProfile = {
      name:              displayName,
      goals:             selectedGoals,
      selectedFoods:     noFoodPref     ? [] : selectedFoods,
      selectedExercises: noExercisePref ? [] : selectedExercises,
      selectedMentality: noMentalityPref ? [] : selectedMentality,
      noFoodPreference:      noFoodPref,
      noExercisePreference:  noExercisePref,
      noMentalityPreference: noMentalityPref,
      createdAt: new Date().toISOString(),
    };
    const plan = generateThreeDayPlan(user);
    saveUserProfile(user);
    saveCurrentPlan(plan);
    // Sync to Supabase immediately (fire and forget)
    syncUserProfile(user).catch(() => {});
    syncPlan(plan).catch(() => {});
    // Show thinking loading screen for 3.5s before entering the app
    setIsCreating(true);
    setTimeout(onComplete, 3500);
  };

  const hasEnoughFoods     = noFoodPref     || selectedFoods.length >= 10;
  const hasEnoughExercises = noExercisePref || selectedExercises.length >= 5;
  const hasEnoughMentality = noMentalityPref || selectedMentality.length >= 3;
  const progressPct        = (step / TOTAL_STEPS) * 100;

  const slideProps = {
    initial:    { opacity: 0, x: 40 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: -40 },
    transition: { type: 'spring' as const, stiffness: 280, damping: 28 },
  };

  const NoPrefToggle = ({ active, onToggle, label, activeLabel }: {
    active: boolean; onToggle: () => void; label: string; activeLabel: string;
  }) => (
    <motion.button
      onClick={onToggle}
      className="w-full mb-3 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
      style={{
        background: active ? '#22c55e' : '#f3f4f6',
        color:      active ? 'white'   : '#6b7280',
        boxShadow:  active ? '0 4px 0 0 #15803d' : '0 3px 0 0 #d1d5db',
      }}
      whileTap={{ scale: 0.97, y: 2, boxShadow: 'none' }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <motion.span
        animate={{ rotate: active ? 360 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        🎲
      </motion.span>
      {active ? activeLabel : label}
      {active && <Check className="w-4 h-4" />}
    </motion.button>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>

      {/* Progress bar */}
      <div className="px-4 pt-10 pb-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-gray-500">Step {step} of {TOTAL_STEPS}</span>
          <span className="text-xs font-bold text-dem-green-600">{STEP_NAMES[step - 1]}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-dem-green-500"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Goal selection ── */}
        {step === 1 && (
          <motion.div key="step1" {...slideProps} className="flex-1 flex flex-col p-4 pt-6">
            <div className="flex justify-center mb-4">
              <Mascot
                message={`Nice to meet you, ${displayName}! What are you here to work on? 🎯`}
                mood="happy"
                persistent
                currentEnergy="high"
                size={100}
              />
            </div>
            <Card className="mb-4">
              <h1 className="text-3xl font-black text-gray-900 mb-1">
                Welcome to <span className="text-dem-green-500">Dem</span>!
              </h1>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                Diet · Exercise · Mentality. Select your goals — we'll tailor your plan around what matters most.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_OPTIONS.map(goal => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <motion.button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className="relative px-3 py-3 rounded-xl border-2 text-left"
                      style={{
                        borderColor: isSelected ? '#22c55e' : '#e5e7eb',
                        background:  isSelected ? '#f0fdf4' : 'white',
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-lg flex-shrink-0">{goal.emoji}</span>
                          <span className="text-xs font-semibold text-gray-800 leading-tight">{goal.label}</span>
                        </div>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              className="flex-shrink-0"
                            >
                              <Check className="w-4 h-4 text-dem-green-600" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
            <Button onClick={() => setStep(2)} className="w-full text-lg">
              {selectedGoals.length > 0
                ? `${selectedGoals.length} goal${selectedGoals.length > 1 ? 's' : ''} set, Next →`
                : "Next →"}
            </Button>
          </motion.div>
        )}

        {/* ── Step 2: Food selection ── */}
        {step === 2 && (
          <motion.div key="step2" {...slideProps} className="flex-1 flex flex-col">
            <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
              <NoPrefToggle
                active={noFoodPref}
                onToggle={() => setNoFoodPref(v => !v)}
                label="No preference (skip selection)"
                activeLabel="No preference, surprise me!"
              />
              <AnimatePresence>
                {!noFoodPref && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <FoodPieChart selectedFoodIds={selectedFoods} />
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <h2 className="text-xl font-black text-gray-900">Pick Your Foods</h2>
                        <p className="text-xs text-gray-500">Select at least 10. We'll build your meals from these.</p>
                      </div>
                      <motion.div
                        className="px-3 py-1.5 rounded-full text-sm font-black"
                        animate={{
                          background: hasEnoughFoods ? '#22c55e' : '#f3f4f6',
                          color:      hasEnoughFoods ? 'white'   : '#6b7280',
                        }}
                      >
                        {selectedFoods.length} / 10+
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {noFoodPref && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl p-3 text-center" style={{ background: '#f0fdf4', border: '2px solid #86efac' }}>
                      <p className="text-sm font-bold text-green-700">We'll rotate from our full food library every day 🌈</p>
                      <p className="text-xs text-green-600 mt-0.5">You can still pick foods below to mix it in.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {(Object.entries(foodsByCategory) as [keyof typeof FOOD_CATEGORIES, typeof FOODS][]).map(([category, foods]) => (
                <Card key={category}>
                  <h3 className="font-black text-gray-800 mb-3 text-base">{FOOD_CATEGORIES[category]}</h3>
                  <SelectionGrid
                    items={foods.map(f => ({ id: f.id, emoji: f.emoji, name: f.name }))}
                    selected={selectedFoods}
                    onToggle={toggle(setSelectedFoods)}
                  />
                </Card>
              ))}
            </div>
            <div className="p-4 pt-2 flex gap-3" style={{ background: 'linear-gradient(to top, #f0fdf4 70%, transparent)' }}>
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-none px-5">←</Button>
              <Button onClick={() => setStep(3)} disabled={!hasEnoughFoods} className="flex-1 text-base">
                {hasEnoughFoods ? 'Next →' : `Select ${Math.max(0, 10 - selectedFoods.length)} more`}
              </Button>
            </div>
            <FloatingMascot
              energy="high"
              userName={displayName}
              firstVisitMessage={`Hey ${displayName}! Pick at least 10 foods you like, or tap "No preference" to skip!`}
            />
          </motion.div>
        )}

        {/* ── Step 3: Exercise selection ── */}
        {step === 3 && (
          <motion.div key="step3" {...slideProps} className="flex-1 flex flex-col">
            <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
              <NoPrefToggle
                active={noExercisePref}
                onToggle={() => setNoExercisePref(v => !v)}
                label="No preference (use all exercises)"
                activeLabel="No preference, mix it up!"
              />
              <AnimatePresence>
                {!noExercisePref && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black text-gray-900">Pick Your Exercises</h2>
                        <p className="text-xs text-gray-500">Select at least 5. Your daily workouts pull from these.</p>
                      </div>
                      <motion.div
                        className="px-3 py-1.5 rounded-full text-sm font-black"
                        animate={{
                          background: hasEnoughExercises ? '#22c55e' : '#f3f4f6',
                          color:      hasEnoughExercises ? 'white'   : '#6b7280',
                        }}
                      >
                        {selectedExercises.length} / 5+
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {(Object.entries(exercisesByGroup) as [keyof typeof EXERCISE_GROUPS, typeof EXERCISES][]).map(([group, exercises]) => (
                <Card key={group}>
                  <h3 className="font-black text-gray-800 mb-3 text-base">{EXERCISE_GROUPS[group]}</h3>
                  <SelectionGrid
                    items={exercises.map(e => ({ id: e.id, emoji: e.emoji, name: e.name }))}
                    selected={selectedExercises}
                    onToggle={toggle(setSelectedExercises)}
                  />
                </Card>
              ))}
            </div>
            <div className="p-4 pt-2 flex gap-3" style={{ background: 'linear-gradient(to top, #f0fdf4 70%, transparent)' }}>
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-none px-5">←</Button>
              <Button onClick={() => setStep(4)} disabled={!hasEnoughExercises} className="flex-1 text-base">
                {hasEnoughExercises ? 'Next →' : `Select ${Math.max(0, 5 - selectedExercises.length)} more`}
              </Button>
            </div>
            <FloatingMascot
              energy="high"
              userName={displayName}
              firstVisitMessage={`Nice, ${displayName}! Pick at least 5 exercises you enjoy. Your workouts will pull from these.`}
            />
          </motion.div>
        )}

        {/* ── Step 4: Mentality selection ── */}
        {step === 4 && (
          <motion.div key="step4" {...slideProps} className="flex-1 flex flex-col">
            <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
              <NoPrefToggle
                active={noMentalityPref}
                onToggle={() => setNoMentalityPref(v => !v)}
                label="No preference (use all check-ins)"
                activeLabel="No preference, surprise me!"
              />
              <AnimatePresence>
                {!noMentalityPref && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black text-gray-900">Your Mind Check-ins</h2>
                        <p className="text-xs text-gray-500">Select at least 3. Mental health is the third pillar.</p>
                      </div>
                      <motion.div
                        className="px-3 py-1.5 rounded-full text-sm font-black"
                        animate={{
                          background: hasEnoughMentality ? '#7c3aed' : '#f3f4f6',
                          color:      hasEnoughMentality ? 'white'   : '#6b7280',
                        }}
                      >
                        {selectedMentality.length} / 3+
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {(Object.entries(mentalityByPillar) as [keyof typeof MENTALITY_PILLARS, typeof MENTALITY_CHECKS][]).map(([pillar, checks]) => (
                <Card key={pillar}>
                  <h3 className="font-black text-gray-800 mb-3 text-base">{MENTALITY_PILLARS[pillar]}</h3>
                  <SelectionGrid
                    items={checks.map(m => ({ id: m.id, emoji: m.emoji, name: m.title }))}
                    selected={selectedMentality}
                    onToggle={toggle(setSelectedMentality)}
                  />
                </Card>
              ))}
            </div>
            <div className="p-4 pt-2 flex gap-3" style={{ background: 'linear-gradient(to top, #f0fdf4 70%, transparent)' }}>
              <Button variant="secondary" onClick={() => setStep(3)} className="flex-none px-5">←</Button>
              <Button onClick={handleComplete} disabled={!hasEnoughMentality} className="flex-1 text-base">
                {hasEnoughMentality ? 'Create My Plan →' : `Select ${Math.max(0, 3 - selectedMentality.length)} more`}
              </Button>
            </div>
            <FloatingMascot
              energy="high"
              userName={displayName}
              firstVisitMessage="Almost there! Pick at least 3 mental check-ins. They keep your mind as healthy as your body."
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Plan creation loading screen */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {/* Floating question marks */}
            {['?', '?', '?', '?', '?'].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-3xl font-black select-none pointer-events-none"
                style={{
                  left:  `${10 + i * 18}%`,
                  top:   `${20 + (i % 2) * 15}%`,
                  color: i % 2 === 0 ? '#22c55e' : '#3b82f6',
                  opacity: 0,
                }}
                animate={{ opacity: [0, 0.7, 0], y: [0, -40, -80], rotate: [0, i % 2 === 0 ? 15 : -15, 0] }}
                transition={{ delay: i * 0.4, duration: 2.0, repeat: Infinity, ease: 'easeOut' }}
              >
                ?
              </motion.span>
            ))}

            {/* Mascot in thinking mood */}
            <Mascot
              mood="thinking"
              currentEnergy="medium"
              persistent={false}
              size={110}
            />

            {/* Thought bubble trail + bubble */}
            <div className="flex flex-col items-center mt-3">
              <div className="flex items-end gap-1.5 mb-1 self-start ml-16">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />
              </div>
              <motion.div
                className="bg-white rounded-3xl px-6 py-4 shadow-xl border-2 border-gray-100 max-w-xs text-center"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 320, damping: 24 }}
              >
                <motion.p
                  className="text-base font-black text-gray-800"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Creating your plan...
                </motion.p>
                <p className="text-xs text-gray-400 mt-1">Personalizing just for you</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
