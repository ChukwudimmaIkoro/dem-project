'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeDayPlan, DayPlan, EnergyLevel } from '@/types';
import {
  loadAppState, updatePlan, clearAppState,
  saveCurrentPlan, hasShownEnergyModal, saveEnergyModalShown,
} from '@/lib/storage';
import {
  isDayComplete, calculateStreak,
  generateThreeDayPlan, shuffleDietMeals,
} from '@/lib/planGenerator';
import { ENERGY_CONFIG } from './Mascot';
import { Button } from './Button';
import { Card } from './Card';
import {
  Check, Flame, RotateCcw, Utensils, Dumbbell, Brain,
  Sunrise, Sun, Moon, Coffee, Sparkles, type LucideIcon,
} from 'lucide-react';
import BottomNav from './BottomNav';
import PillarTabs from './PillarTabs';
import EnergyModal from './EnergyModal';
import Mascot from './Mascot';
import AIRecipeCard from './AIRecipeCard';
import AIHealthInsights from './AIHealthInsights';
import FloatingMascot from './FloatingMascot';

// ─── Energy theme tokens ────────────────────────────────────────────────────────

const ENERGY_THEME = {
  high: {
    bg1:         '#f0fdf4',
    bg2:         '#ecfdf5',
    accent:      '#22c55e',
    accentDark:  '#15803d',
    accentLight: '#dcfce7',
    accentText:  '#15803d',
    label:       'High Energy',
    emoji:       '🔥',
  },
  medium: {
    bg1:         '#fefce8',
    bg2:         '#fffbeb',
    accent:      '#eab308',
    accentDark:  '#a16207',
    accentLight: '#fef9c3',
    accentText:  '#854d0e',
    label:       'Medium Energy',
    emoji:       '⚡',
  },
  low: {
    bg1:         '#eff6ff',
    bg2:         '#f0f9ff',
    accent:      '#3b82f6',
    accentDark:  '#1d4ed8',
    accentLight: '#dbeafe',
    accentText:  '#1e40af',
    label:       'Low Energy',
    emoji:       '💙',
  },
} as const;

// ─── SVG Dice ───────────────────────────────────────────────────────────────────

function DiceIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="3" ry="3" />
      <circle cx="8"  cy="8"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="8"  cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface PlanViewProps { onReset: () => void }

// ─── Main component ─────────────────────────────────────────────────────────────

export default function PlanView({ onReset }: PlanViewProps) {
  const [plan,            setPlan]           = useState<ThreeDayPlan | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'plan' | 'account' | 'progress'>('plan');
  const [activePillar,    setActivePillar]    = useState<'diet' | 'exercise' | 'mentality'>('diet');
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [energySetMessage, setEnergySetMessage] = useState('');
  const [tabMessage,      setTabMessage]      = useState('');
  const [lastPillar,      setLastPillar]      = useState<'diet' | 'exercise' | 'mentality'>('diet');
  const [userName,        setUserName]        = useState('');
  const [userFoods,       setUserFoods]       = useState<string[]>([]);
  const [showDayWarning,  setShowDayWarning]  = useState(false);
  const [pendingDayIdx,   setPendingDayIdx]   = useState<number | null>(null);
  // Energy transition overlay
  const [showEnergyTransition, setShowEnergyTransition] = useState(false);
  const [transitionEnergy,     setTransitionEnergy]     = useState<EnergyLevel>('medium');

  useEffect(() => {
    const state = loadAppState();
    if (state.currentPlan) {
      setPlan(state.currentPlan);
      const firstIncomplete = state.currentPlan.days.findIndex(d => !isDayComplete(d));
      const dayIdx = firstIncomplete === -1 ? 2 : firstIncomplete;
      setCurrentDayIndex(dayIdx);
      if (state.user?.name)          setUserName(state.user.name);
      if (state.user?.selectedFoods) setUserFoods(state.user.selectedFoods);

      const dayNumber = state.currentPlan.days[dayIdx].dayNumber;
      if (!hasShownEnergyModal(dayNumber)) {
        setTimeout(() => setShowEnergyModal(true), 600);
      }
    }
  }, []);

  // Mascot message on pillar tab change
  const getMascotTabMessage = (pillar: 'diet' | 'exercise' | 'mentality') => {
    if (pillar === 'diet')      return 'Fuel your body with foods you love!';
    if (pillar === 'exercise')  return 'Move your body, feel the energy!';
    return 'Your mind is the foundation — this matters most.';
  };

  useEffect(() => {
    if (activePillar !== lastPillar) {
      setTabMessage(getMascotTabMessage(activePillar));
      setLastPillar(activePillar);
      const t = setTimeout(() => setTabMessage(''), 5000);
      return () => clearTimeout(t);
    }
  }, [activePillar, lastPillar]);

  if (!plan) return <div className="p-4 text-center text-gray-400 pt-20">Loading...</div>;

  const currentDay = plan.days[currentDayIndex];
  const streak     = calculateStreak(plan);
  const isComplete = isDayComplete(currentDay);
  const theme      = ENERGY_THEME[currentDay.energyLevel];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEnergySelect = (energy: EnergyLevel) => {
    setShowEnergyModal(false);
    const state = loadAppState();
    if (!state.user || !state.currentPlan) return;

    const newPlan = { ...state.currentPlan };
    const energyLevels: [EnergyLevel, EnergyLevel, EnergyLevel] = [
      currentDayIndex === 0 ? energy : newPlan.days[0].energyLevel,
      currentDayIndex === 1 ? energy : newPlan.days[1].energyLevel,
      currentDayIndex === 2 ? energy : newPlan.days[2].energyLevel,
    ];
    const regenerated = generateThreeDayPlan(state.user, energyLevels);
    regenerated.days.forEach((day, idx) => { day.completed = newPlan.days[idx].completed; });
    saveCurrentPlan(regenerated);
    setPlan(regenerated);
    saveEnergyModalShown(regenerated.days[currentDayIndex].dayNumber);

    // Trigger full-screen zoom overlay
    setTransitionEnergy(energy);
    setShowEnergyTransition(true);
    setTimeout(() => setShowEnergyTransition(false), 1800);

    setEnergySetMessage(`${ENERGY_THEME[energy].label} set! Tap me anytime to change.`);
    setTimeout(() => setEnergySetMessage(''), 8000);
  };

  const toggleTask = (pillar: 'diet' | 'exercise' | 'mentality') => {
    updatePlan(p => {
      const updated = { ...p };
      updated.days[currentDayIndex].completed[pillar] =
        !updated.days[currentDayIndex].completed[pillar];
      if (isDayComplete(updated.days[currentDayIndex]) && !isComplete) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2200);
      }
      return updated;
    });
    const s = loadAppState();
    if (s.currentPlan) setPlan(s.currentPlan);
  };

  const handleDayChange = (dayIdx: number) => {
    if (dayIdx > currentDayIndex && !isDayComplete(plan.days[currentDayIndex])) {
      setPendingDayIdx(dayIdx);
      setShowDayWarning(true);
      return;
    }
    commitDayChange(dayIdx);
  };

  const commitDayChange = (dayIdx: number) => {
    setCurrentDayIndex(dayIdx);
    setShowDayWarning(false);
    setPendingDayIdx(null);
    const dayNumber = plan.days[dayIdx].dayNumber;
    if (!hasShownEnergyModal(dayNumber) && !isDayComplete(plan.days[dayIdx])) {
      setTimeout(() => setShowEnergyModal(true), 300);
    }
  };

  const handleReset = () => {
    if (confirm('Start over? This will clear your current progress.')) {
      clearAppState();
      onReset();
    }
  };

  // ── Account tab ──────────────────────────────────────────────────────────

  if (activeBottomTab === 'account') {
    return (
      <EnergyBackground energy={currentDay.energyLevel}>
        <div className="min-h-screen pb-24 p-4">
          <div className="text-center pt-10">
            <Card className="mb-4">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Account</h2>
              <p className="text-gray-500 mb-5 text-sm">
                Profile customization, preferences, and more are on the way!
              </p>
              <Button variant="ghost" onClick={handleReset} className="w-full text-red-500">
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                Reset Progress
              </Button>
            </Card>
          </div>
          <FloatingMascot
            energy={currentDay.energyLevel}
            userName={userName}
            firstVisitMessage={`Hey ${userName || 'friend'}! This is your Account tab — settings and profile customization are on the way!`}
          />
          <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} accentColor={theme.accent} />
        </div>
      </EnergyBackground>
    );
  }

  // ── Progress tab ─────────────────────────────────────────────────────────

  if (activeBottomTab === 'progress') {
    const energyHistory    = plan.days.map(d => d.energyLevel);
    const completionHistory = plan.days.map(d => d.completed);
    return (
      <EnergyBackground energy={currentDay.energyLevel}>
        <div className="min-h-screen pb-24 p-4">
          <div className="pt-8">

            {/* Streak card */}
            <Card className="mb-4 text-center">
              <motion.div
                className="flex items-center justify-center gap-2 mb-2"
                animate={{ scale: streak > 0 ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                <Flame className="w-10 h-10" style={{ color: theme.accent }} />
                <span className="text-6xl font-black" style={{ color: theme.accent }}>{streak}</span>
              </motion.div>
              <p className="font-black text-gray-800 text-lg">Day Streak</p>
              <p className="text-gray-500 text-sm mt-1">
                {streak === 0
                  ? 'Complete today to start your streak!'
                  : `${streak} day${streak !== 1 ? 's' : ''} completed — amazing work!`}
              </p>
            </Card>

            {/* Day completion pills */}
            <Card className="mb-4">
              <h3 className="font-black text-gray-800 mb-3 text-base">3-Day Overview</h3>
              <div className="grid grid-cols-3 gap-2">
                {plan.days.map((day, idx) => {
                  const done = isDayComplete(day);
                  const isNow = idx === currentDayIndex;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl p-3 text-center"
                      style={{
                        background: done ? theme.accentLight : isNow ? `${theme.accent}11` : '#f9fafb',
                        border: `2px solid ${done ? theme.accent : isNow ? `${theme.accent}44` : '#e5e7eb'}`,
                      }}
                    >
                      <div className="text-2xl mb-1">{done ? '✅' : isNow ? '👀' : '⏳'}</div>
                      <div className="text-xs font-black text-gray-700">Day {day.dayNumber}</div>
                      <div className="text-xs text-gray-500 capitalize">{day.energyLevel}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-3xl p-5 text-center mb-4 text-white"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
              >
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-xl font-black mb-1">3-Day Complete!</h3>
                <p className="text-sm opacity-90">Ready for 5 days? Coming soon!</p>
              </motion.div>
            )}

            <AIHealthInsights
              energyHistory={energyHistory}
              completionHistory={completionHistory}
              userName={userName}
              streak={streak}
              currentDayNumber={currentDay.dayNumber}
            />
          </div>
          <FloatingMascot
            energy={currentDay.energyLevel}
            userName={userName}
            firstVisitMessage={`Hey ${userName || 'friend'}! This is your Progress tab — track your streak and get your AI health summary here.`}
          />
          <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} accentColor={theme.accent} />
        </div>
      </EnergyBackground>
    );
  }

  // ── Main Plan tab ─────────────────────────────────────────────────────────

  return (
    <EnergyBackground energy={currentDay.energyLevel}>
      {/* Energy change full-screen overlay */}
      <AnimatePresence>
        {showEnergyTransition && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <Mascot
                currentEnergy={transitionEnergy}
                userName={userName}
                mood={transitionEnergy === 'high' ? 'excited' : transitionEnergy === 'low' ? 'calm' : 'happy'}
                message={ENERGY_THEME[transitionEnergy].label + '! ' + ENERGY_THEME[transitionEnergy].emoji}
                persistent
                size={130}
              />
              <motion.div
                className="mt-4 px-6 py-3 rounded-2xl text-white font-black text-lg"
                style={{ background: ENERGY_CONFIG[transitionEnergy].color }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                Plan updated {ENERGY_THEME[transitionEnergy].emoji}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EnergyModal
        isOpen={showEnergyModal}
        currentEnergy={currentDay.energyLevel}
        onSelect={handleEnergySelect}
        dayNumber={currentDay.dayNumber}
      />

      {/* Incomplete day warning */}
      <AnimatePresence>
        {showDayWarning && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">⚠️</div>
                <h3 className="text-lg font-black text-gray-900 mb-1">
                  Day {currentDay.dayNumber} isn't done yet!
                </h3>
                <p className="text-gray-500 text-sm">
                  You haven't completed all tasks. Move on anyway?
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => { setShowDayWarning(false); setPendingDayIdx(null); }}
                  className="flex-1"
                >
                  Stay here
                </Button>
                <Button
                  onClick={() => pendingDayIdx !== null && commitDayChange(pendingDayIdx)}
                  className="flex-1"
                  energyColor={theme.accent}
                >
                  Move on
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen pb-24 px-4">
        {/* Header */}
        <div className="flex justify-between items-center pt-5 mb-4">
          <div>
            <motion.h1
              className="text-3xl font-black"
              animate={{ color: theme.accent }}
              transition={{ duration: 0.6 }}
            >
              Dem
            </motion.h1>
            <p className="text-sm text-gray-500 font-semibold">Day {currentDay.dayNumber} of 3</p>
          </div>

          {/* Streak badge */}
          <motion.div
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl"
            animate={{ background: `${theme.accent}18` }}
            transition={{ duration: 0.6 }}
          >
            <Flame className="w-5 h-5" style={{ color: theme.accent }} />
            <span className="text-2xl font-black" style={{ color: theme.accent }}>{streak}</span>
            <span className="text-xs font-bold text-gray-500">streak</span>
          </motion.div>
        </div>

        {/* Day navigator */}
        <div className="flex gap-2.5 mb-5">
          {plan.days.map((day, idx) => {
            const done      = isDayComplete(day);
            const isCurrent = idx === currentDayIndex;
            const dotColor  = ENERGY_CONFIG[day.energyLevel].color;
            return (
              <motion.button
                key={idx}
                onClick={() => handleDayChange(idx)}
                className="flex-1 relative rounded-2xl py-3 flex flex-col items-center gap-1"
                style={{
                  background: isCurrent ? theme.accent : done ? `${theme.accent}22` : '#f3f4f6',
                  boxShadow:  isCurrent
                    ? `0 4px 0 0 ${theme.accentDark}66, 0 2px 8px ${theme.accent}33`
                    : `0 2px 0 0 #d1d5db`,
                }}
                whileTap={{ scale: 0.95, y: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <span
                  className="text-xl font-black"
                  style={{ color: isCurrent ? 'white' : done ? theme.accentDark : '#6b7280' }}
                >
                  {done ? '✓' : idx + 1}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isCurrent ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}
                >
                  Day {idx + 1}
                </span>
                {/* Energy dot */}
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  style={{ background: dotColor }}
                />
              </motion.button>
            );
          })}
        </div>

        {/* Day complete banner */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="rounded-3xl mb-4 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
            >
              <div className="p-4 text-center text-white">
                <div className="text-3xl mb-1">🎉</div>
                <p className="font-black text-lg">Day {currentDay.dayNumber} Complete!</p>
                <p className="text-sm opacity-85">You're absolutely crushing it!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot — clickable to open energy modal */}
        <motion.div
          className="flex justify-center mb-4 cursor-pointer"
          onClick={() => setShowEnergyModal(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          title="Tap to change energy level"
        >
          <Mascot
            key={activePillar}
            message={energySetMessage || tabMessage}
            mood={activePillar === 'mentality' ? 'encouraging' : currentDay.energyLevel === 'high' ? 'excited' : 'happy'}
            persistent={false}
            currentEnergy={currentDay.energyLevel}
            userName={userName}
            dayNumber={currentDay.dayNumber}
            completedTasks={Object.entries(currentDay.completed).filter(([, v]) => v).map(([k]) => k)}
            streak={streak}
            pillar={activePillar}
            size={96}
          />
        </motion.div>

        {/* Pillar tabs */}
        <PillarTabs
          activePillar={activePillar}
          onPillarChange={setActivePillar}
          completedPillars={currentDay.completed}
        />

        {/* Pillar content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {activePillar === 'diet' && (
              <DietView
                key={`diet-${currentDay.dayNumber}-${currentDay.energyLevel}`}
                day={currentDay}
                isCompleted={currentDay.completed.diet}
                onToggle={() => toggleTask('diet')}
                userName={userName}
                userFoods={userFoods}
                accentColor={theme.accent}
              />
            )}
            {activePillar === 'exercise' && (
              <ExerciseView
                day={currentDay}
                isCompleted={currentDay.completed.exercise}
                onToggle={() => toggleTask('exercise')}
              />
            )}
            {activePillar === 'mentality' && (
              <MentalityView
                day={currentDay}
                isCompleted={currentDay.completed.mentality}
                onToggle={() => toggleTask('mentality')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} accentColor={theme.accent} />

      {/* Day complete celebration pop */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-4xl p-10 text-center shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1,   rotate: 0  }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="text-7xl mb-3">🎉</div>
              <p className="text-3xl font-black text-white">Day Complete!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </EnergyBackground>
  );
}

// ─── Energy-reactive background ─────────────────────────────────────────────────

function EnergyBackground({ energy, children }: { energy: EnergyLevel; children: React.ReactNode }) {
  const theme = ENERGY_THEME[energy];
  return (
    <div className="relative min-h-screen">
      <AnimatePresence>
        <motion.div
          key={energy}
          className="fixed inset-0 -z-10"
          style={{ background: `linear-gradient(160deg, ${theme.bg1} 0%, ${theme.bg2} 100%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
      </AnimatePresence>
      {children}
    </div>
  );
}

// ─── Diet view ───────────────────────────────────────────────────────────────────

function DietView({ day, isCompleted, onToggle, userName, userFoods, accentColor }: {
  day: DayPlan; isCompleted: boolean; onToggle: () => void;
  userName?: string; userFoods: string[]; accentColor: string;
}) {
  const [meals,   setMeals]   = useState(day.diet.meals);
  const [spinning, setSpinning] = useState<string | null>(null);

  const shuffleMeal = (mealKey: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSpinning(mealKey);
    setTimeout(() => {
      const newDiet = shuffleDietMeals(userFoods, day.energyLevel, day.dayNumber);
      setMeals(prev => ({ ...prev, [mealKey]: newDiet.meals[mealKey] }));
      updatePlan(plan => {
        const updated = { ...plan };
        const dayIdx = plan.days.findIndex(d => d.dayNumber === day.dayNumber);
        if (dayIdx !== -1) {
          updated.days[dayIdx] = {
            ...updated.days[dayIdx],
            diet: { ...updated.days[dayIdx].diet, meals: { ...updated.days[dayIdx].diet.meals, [mealKey]: newDiet.meals[mealKey] } },
          };
        }
        return updated;
      });
      setSpinning(null);
    }, 380);
  };

  return (
    <Card className={isCompleted ? 'ring-2' : ''} style={isCompleted ? { ringColor: accentColor } as React.CSSProperties : {}}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Utensils className="w-5 h-5" style={{ color: accentColor }} />
            <h3 className="text-xl font-black text-gray-900">Today's Meals</h3>
          </div>
          <p className="text-sm font-semibold" style={{ color: accentColor }}>{day.diet.focus}</p>
        </div>
        <motion.button
          onClick={onToggle}
          className="w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-colors"
          style={{
            background:   isCompleted ? accentColor : 'transparent',
            borderColor:  isCompleted ? accentColor : '#d1d5db',
          }}
          whileTap={{ scale: 0.9 }}
        >
          {isCompleted && <Check className="w-5 h-5 text-white" />}
        </motion.button>
      </div>

      <MealSectionShuffleable title="Breakfast" items={meals.breakfast} Icon={Sunrise}
        mealKey="breakfast" spinning={spinning === 'breakfast'} onShuffle={() => shuffleMeal('breakfast')}
        dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} />
      <MealSectionShuffleable title="Lunch" items={meals.lunch} Icon={Sun}
        mealKey="lunch" spinning={spinning === 'lunch'} onShuffle={() => shuffleMeal('lunch')}
        dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} />
      <MealSectionShuffleable title="Dinner" items={meals.dinner} Icon={Moon}
        mealKey="dinner" spinning={spinning === 'dinner'} onShuffle={() => shuffleMeal('dinner')}
        dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} />
      {meals.snack && meals.snack.length > 0 && (
        <MealSectionShuffleable title="Snack" items={meals.snack} Icon={Coffee}
          mealKey="snack" spinning={spinning === 'snack'} onShuffle={() => shuffleMeal('snack')}
          dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} />
      )}
    </Card>
  );
}

function MealSectionShuffleable({ title, items, Icon, mealKey, spinning, onShuffle, dayNumber, energyLevel, userName }: {
  title: string; items: string[]; Icon: LucideIcon;
  mealKey: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  spinning: boolean; onShuffle: () => void;
  dayNumber: number; energyLevel: EnergyLevel; userName?: string;
}) {
  return (
    <div className="mb-3">
      <AIRecipeCard foods={items ?? []} mealType={mealKey}
        energyLevel={energyLevel} dayNumber={dayNumber} userName={userName} />
      <div className="bg-gray-50 p-3 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-black text-gray-700">{title}</h4>
          </div>
          <motion.button
            onClick={onShuffle}
            disabled={spinning}
            title="Shuffle meal"
            className="text-gray-400 hover:text-dem-green-500 transition-colors disabled:opacity-30"
            whileTap={{ rotate: 180, scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <DiceIcon className="w-5 h-5" />
          </motion.button>
        </div>
        <motion.div
          animate={{ opacity: spinning ? 0.35 : 1 }}
          className="flex flex-wrap gap-1.5"
        >
          {items.map((item, idx) => (
            <span key={idx}
              className="text-sm px-3 py-1 rounded-full font-semibold bg-dem-green-100 text-dem-green-700">
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Exercise view ───────────────────────────────────────────────────────────────

function ExerciseView({ day, isCompleted, onToggle }: {
  day: DayPlan; isCompleted: boolean; onToggle: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Dumbbell className="w-5 h-5 text-dem-blue-500" />
            <h3 className="text-xl font-black text-gray-900">Today's Movement</h3>
          </div>
          <p className="text-sm font-semibold text-dem-blue-600">{day.exercise.focus}</p>
        </div>
        <motion.button
          onClick={onToggle}
          className="w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-colors"
          style={{
            background:   isCompleted ? '#22c55e' : 'transparent',
            borderColor:  isCompleted ? '#22c55e'  : '#d1d5db',
          }}
          whileTap={{ scale: 0.9 }}
        >
          {isCompleted && <Check className="w-5 h-5 text-white" />}
        </motion.button>
      </div>

      <div className="space-y-3">
        {day.exercise.exercises.map(ex => (
          <div key={ex.id} className="bg-dem-blue-50 p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-1.5">
              <h4 className="font-black text-gray-900 text-base">{ex.name}</h4>
              <span className="text-xs bg-dem-blue-500 text-white px-3 py-1 rounded-full font-bold ml-2 flex-shrink-0">
                {ex.duration}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{ex.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Mentality view ──────────────────────────────────────────────────────────────

function MentalityView({ day, isCompleted, onToggle }: {
  day: DayPlan; isCompleted: boolean; onToggle: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Brain className="w-5 h-5 text-dem-purple-500" />
            <h3 className="text-xl font-black text-gray-900">Mental Check-In</h3>
          </div>
          <p className="text-sm font-semibold text-dem-purple-500">{day.mentality.check.title}</p>
        </div>
        <motion.button
          onClick={onToggle}
          className="w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-colors"
          style={{
            background:   isCompleted ? '#22c55e' : 'transparent',
            borderColor:  isCompleted ? '#22c55e'  : '#d1d5db',
          }}
          whileTap={{ scale: 0.9 }}
        >
          {isCompleted && <Check className="w-5 h-5 text-white" />}
        </motion.button>
      </div>

      <div className="bg-dem-purple-50 p-5 rounded-2xl mb-3">
        <div className="flex justify-center mb-3">
          <Sparkles className="w-9 h-9 text-dem-purple-400" />
        </div>
        <p className="text-gray-800 leading-relaxed text-base text-center mb-3">
          {day.mentality.check.content}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
          <span>⏱</span>
          <span>{day.mentality.check.duration}</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: '#fef9c3', border: '2px solid #fde047' }}>
        <p className="text-sm text-gray-700 text-center font-semibold leading-relaxed">
          💡 Mentality is the glue. Without it, diet and exercise don't stick.
        </p>
      </div>
    </Card>
  );
}
