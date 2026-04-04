'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { FOODS } from '@/lib/foods';
import { EXERCISES } from '@/lib/exercises';
import { MENTALITY_CHECKS } from '@/lib/mentality';
import { loadAppState, saveUserProfile, saveCurrentPlan } from '@/lib/storage';
import { generatePlan } from '@/lib/planGenerator';
import { ThreeDayPlan } from '@/types';

type PillarKey = 'diet' | 'exercise' | 'mentality';

interface PreferencesModalProps {
  pillar: PillarKey;
  onClose: () => void;
  onSaved: (newPlan: ThreeDayPlan) => void;
}

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

function SelectionGrid({
  items, selected, onToggle,
}: {
  items: { id: string; emoji: string; name: string }[];
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
            className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left"
            style={{
              borderColor: isSelected ? '#22c55e' : '#e5e7eb',
              background:  isSelected ? '#f0fdf4' : 'white',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <span className="text-base">{item.emoji}</span>
            <span className="text-xs font-semibold text-gray-800 leading-tight flex-1">{item.name}</span>
            {isSelected && <Check className="w-3.5 h-3.5 text-dem-green-600 flex-shrink-0" />}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function PreferencesModal({ pillar, onClose, onSaved }: PreferencesModalProps) {
  const state = loadAppState();
  const user  = state.user!;
  const plan  = state.currentPlan!;

  const [selectedFoods,     setSelectedFoods]     = useState<string[]>(user.selectedFoods ?? []);
  const [selectedExercises, setSelectedExercises] = useState<string[]>(user.selectedExercises ?? []);
  const [selectedMentality, setSelectedMentality] = useState<string[]>(user.selectedMentality ?? []);
  // Always start with the list visible so users can see and edit their selections.
  // They can toggle "no preference" on from here if they want to randomize.
  const [noPref, setNoPref] = useState(false);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    id: string,
  ) => setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      selectedFoods:        pillar === 'diet'      ? (noPref ? [] : selectedFoods)     : user.selectedFoods,
      selectedExercises:    pillar === 'exercise'  ? (noPref ? [] : selectedExercises) : user.selectedExercises,
      selectedMentality:    pillar === 'mentality' ? (noPref ? [] : selectedMentality) : user.selectedMentality,
      noFoodPreference:     pillar === 'diet'      ? noPref : user.noFoodPreference,
      noExercisePreference: pillar === 'exercise'  ? noPref : user.noExercisePreference,
      noMentalityPreference:pillar === 'mentality' ? noPref : user.noMentalityPreference,
    };
    saveUserProfile(updatedUser);
    const newPlan = generatePlan(
      updatedUser,
      plan.planLength ?? 3,
      plan.days.map(d => d.energyLevel),
    );
    newPlan.historicalStreak = plan.historicalStreak ?? 0;
    newPlan.dummyCurrency    = plan.dummyCurrency ?? 0;
    saveCurrentPlan(newPlan);
    onSaved(newPlan);
  };

  const title = pillar === 'diet' ? 'Edit Food Preferences'
    : pillar === 'exercise' ? 'Edit Exercise Preferences'
    : 'Edit Mental Check-ins';

  const minCount = pillar === 'diet' ? 10 : pillar === 'exercise' ? 5 : 3;
  const currentCount = pillar === 'diet' ? selectedFoods.length
    : pillar === 'exercise' ? selectedExercises.length
    : selectedMentality.length;
  const canSave = noPref || currentCount >= minCount;

  // Group items
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

  return (
    <motion.div
      className="fixed inset-0 z-[180] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '88vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* No-preference toggle */}
        <div className="px-5 pt-3">
          <motion.button
            onClick={() => setNoPref(v => !v)}
            className="w-full py-2.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 mb-1"
            style={{
              background: noPref ? '#22c55e' : '#f3f4f6',
              color:      noPref ? 'white'   : '#6b7280',
              boxShadow:  noPref ? '0 4px 0 0 #15803d' : '0 3px 0 0 #d1d5db',
            }}
            whileTap={{ scale: 0.97, y: 2, boxShadow: 'none' }}
          >
            🎲 {noPref ? 'No preference, surprise me!' : 'No preference, just randomize'}
            {noPref && <Check className="w-4 h-4" />}
          </motion.button>
          {!noPref && (
            <p className="text-[11px] text-gray-400 text-center mb-2">
              Select at least {minCount} to save.
            </p>
          )}
        </div>

        {/* Scrollable selection */}
        {!noPref && (
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4 mt-2">
            {pillar === 'diet' && (Object.entries(foodsByCategory) as [keyof typeof FOOD_CATEGORIES, typeof FOODS][]).map(([cat, foods]) => (
              <div key={cat}>
                <h3 className="font-black text-gray-700 text-sm mb-2">{FOOD_CATEGORIES[cat]}</h3>
                <SelectionGrid
                  items={foods.map(f => ({ id: f.id, emoji: f.emoji, name: f.name }))}
                  selected={selectedFoods}
                  onToggle={id => toggle(setSelectedFoods, id)}
                />
              </div>
            ))}

            {pillar === 'exercise' && (Object.entries(exercisesByGroup) as [keyof typeof EXERCISE_GROUPS, typeof EXERCISES][]).map(([grp, exs]) => (
              <div key={grp}>
                <h3 className="font-black text-gray-700 text-sm mb-2">{EXERCISE_GROUPS[grp]}</h3>
                <SelectionGrid
                  items={exs.map(e => ({ id: e.id, emoji: e.emoji, name: e.name }))}
                  selected={selectedExercises}
                  onToggle={id => toggle(setSelectedExercises, id)}
                />
              </div>
            ))}

            {pillar === 'mentality' && (Object.entries(mentalityByPillar) as [keyof typeof MENTALITY_PILLARS, typeof MENTALITY_CHECKS][]).map(([pil, checks]) => (
              <div key={pil}>
                <h3 className="font-black text-gray-700 text-sm mb-2">{MENTALITY_PILLARS[pil]}</h3>
                <SelectionGrid
                  items={checks.map(m => ({ id: m.id, emoji: m.emoji, name: m.title }))}
                  selected={selectedMentality}
                  onToggle={id => toggle(setSelectedMentality, id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        <div className="px-5 py-4 border-t border-gray-100">
          <motion.button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-3.5 rounded-2xl text-base font-black text-white disabled:opacity-50"
            style={{
              background:  canSave ? '#22c55e' : '#d1d5db',
              boxShadow:   canSave ? '0 5px 0 0 #15803d' : 'none',
            }}
            whileTap={canSave ? { scale: 0.97, y: 2, boxShadow: 'none' } : {}}
          >
            {canSave
              ? 'Save and regenerate plan'
              : `Select ${minCount - currentCount} more to save`}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
