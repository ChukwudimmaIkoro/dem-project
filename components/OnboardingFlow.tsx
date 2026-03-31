'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types';
import { FOODS } from '@/lib/foods';
import { generateThreeDayPlan } from '@/lib/planGenerator';
import { saveUserProfile, saveCurrentPlan } from '@/lib/storage';
import { Button } from './Button';
import { Card } from './Card';
import { Check } from 'lucide-react';
import FoodPieChart from './FoodPieChart';
import Mascot from './Mascot';
import FloatingMascot from './FloatingMascot';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const STEP_LABELS = ['Welcome', 'Your Foods'];

const FOOD_CATEGORIES = {
  fruit:       '🍎 Fruits',
  vegetable:   '🥦 Vegetables',
  grain:       '🌾 Grains',
  protein:     '🍗 Proteins',
  'healthy-fat': '🥑 Healthy Fats',
} as const;

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step,          setStep]          = useState(1);
  const [name,          setName]          = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [noPreference,  setNoPreference]  = useState(false);

  const foodsByCategory = {
    fruit:        FOODS.filter(f => f.category === 'fruit'),
    vegetable:    FOODS.filter(f => f.category === 'vegetable'),
    grain:        FOODS.filter(f => f.category === 'grain'),
    protein:      FOODS.filter(f => f.category === 'protein'),
    'healthy-fat': FOODS.filter(f => f.category === 'healthy-fat'),
  };

  const toggleFood = (foodId: string) =>
    setSelectedFoods(prev =>
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );

  const handleComplete = () => {
    const user: UserProfile = {
      name: name.trim() || 'Friend',
      selectedFoods: noPreference ? [] : selectedFoods,
      noFoodPreference: noPreference,
      createdAt: new Date().toISOString(),
    };
    saveUserProfile(user);
    saveCurrentPlan(generateThreeDayPlan(user));
    onComplete();
  };

  const hasEnoughFoods = noPreference || selectedFoods.length >= 10;
  const progressPct   = step === 1 ? 50 : 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
      {/* Progress bar */}
      <div className="px-4 pt-10 pb-0">
        <div className="flex items-center gap-3 mb-1">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{
                  background: i + 1 <= step ? '#22c55e' : '#e5e7eb',
                  color:      i + 1 <= step ? 'white'   : '#9ca3af',
                }}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className="text-xs font-semibold" style={{ color: i + 1 <= step ? '#16a34a' : '#9ca3af' }}>
                {label}
              </span>
            </div>
          ))}
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
        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            className="flex-1 flex flex-col p-4 pt-6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex justify-center mb-4">
              <Mascot
                message="Hi! I'm Dem, your health companion! 👋"
                mood="excited"
                persistent={true}
                currentEnergy="high"
                size={100}
              />
            </div>

            <Card className="mb-4">
              <h1 className="text-3xl font-black text-gray-900 mb-1">
                Welcome to <span className="text-dem-green-500">Dem</span>
              </h1>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Diet · Exercise · Mentality. Your 3-day adaptive health plan starts here.
              </p>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setStep(2)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base
                           focus:border-dem-green-400 focus:outline-none transition-colors
                           placeholder:text-gray-400 font-medium"
              />
            </Card>

            <Button onClick={() => setStep(2)} className="w-full text-lg">
              Let's go! →
            </Button>
          </motion.div>
        )}

        {/* ── Step 2: Food selection ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            className="flex-1 flex flex-col"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* Sticky header */}
            <div
              className="sticky top-0 z-10 px-4 pt-4 pb-3"
              style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}
            >
              {/* No-preference toggle */}
              <motion.button
                onClick={() => setNoPreference(v => !v)}
                className="w-full mb-3 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2"
                style={{
                  background:  noPreference ? '#22c55e' : '#f3f4f6',
                  color:       noPreference ? 'white'   : '#6b7280',
                  boxShadow:   noPreference ? '0 4px 0 0 #15803d' : '0 3px 0 0 #d1d5db',
                }}
                whileTap={{ scale: 0.97, y: 2, boxShadow: 'none' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <motion.span
                  animate={{ rotate: noPreference ? 360 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  🎲
                </motion.span>
                {noPreference ? 'No preference — surprise me!' : 'No preference (skip selection)'}
                {noPreference && <Check className="w-4 h-4" />}
              </motion.button>

              {/* Pie chart + count — hidden in no-preference mode */}
              <AnimatePresence>
                {!noPreference && (
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
                        <p className="text-xs text-gray-500">Select at least 10 — we'll build your meals from these.</p>
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

              {/* No-preference banner */}
              <AnimatePresence>
                {noPreference && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl p-3 text-center" style={{ background: '#f0fdf4', border: '2px solid #86efac' }}>
                      <p className="text-sm font-bold text-green-700">
                        We'll rotate from our full food library every day 🌈
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">You can still pick foods below if you want to mix it in.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Food category grids */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {(Object.entries(foodsByCategory) as [keyof typeof FOOD_CATEGORIES, typeof FOODS][]).map(([category, foods]) => (
                <Card key={category}>
                  <h3 className="font-black text-gray-800 mb-3 text-base">
                    {FOOD_CATEGORIES[category]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {foods.map(food => {
                      const isSelected = selectedFoods.includes(food.id);
                      return (
                        <motion.button
                          key={food.id}
                          onClick={() => toggleFood(food.id)}
                          className="relative px-3 py-2.5 rounded-xl border-2 text-left overflow-hidden"
                          style={{
                            borderColor:   isSelected ? '#22c55e' : '#e5e7eb',
                            background:    isSelected ? '#f0fdf4' : 'white',
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-lg flex-shrink-0">{food.emoji}</span>
                              <span className="text-sm font-semibold text-gray-800 truncate">{food.name}</span>
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
                </Card>
              ))}
            </div>

            {/* Footer actions */}
            <div className="p-4 pt-2 flex gap-3" style={{ background: 'linear-gradient(to top, #f0fdf4 70%, transparent)' }}>
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-none px-5">
                ←
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!hasEnoughFoods}
                className="flex-1 text-base"
              >
                {hasEnoughFoods ? 'Create My Plan →' : `Select ${Math.max(0, 10 - selectedFoods.length)} more`}
              </Button>
            </div>

            <FloatingMascot
              energy="high"
              userName={name.trim() || undefined}
              firstVisitMessage={`${name.trim() ? `Hey ${name.trim()}! ` : 'Hey! '}Pick at least 10 foods you like — or tap "No preference" to skip. We'll build your daily meals from your choices!`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
