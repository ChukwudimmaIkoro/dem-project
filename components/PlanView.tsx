'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeDayPlan, DayPlan, EnergyLevel } from '@/types';
import {
  loadAppState, updatePlan, clearAppState,
  saveCurrentPlan, saveUserProfile, hasShownEnergyModal, saveEnergyModalShown,
} from '@/lib/storage';
import { syncPlan, syncUserProfile, deactivateCloudPlan } from '@/lib/supabaseStorage';
import { supabase } from '@/lib/supabase';
import {
  isDayComplete, calculateStreak,
  generatePlan, generateThreeDayPlan, shuffleDietMeals,
  getActiveDayIndex, regenerateDayForEnergy,
} from '@/lib/planGenerator';
import { DEV_MODE } from '@/lib/devMode';
import { ENERGY_CONFIG } from './Mascot';
import { Button } from './Button';
import { Card } from './Card';
import {
  Check, Flame, RotateCcw, Utensils, Dumbbell, Brain,
  Sunrise, Sun, Moon, Coffee, Sparkles, Wrench, Settings2,
  Lock, CheckCircle2, Eye, Circle, Clock, Lightbulb, CalendarDays, Trophy, ShoppingBasket, X as XIcon, type LucideIcon,
} from 'lucide-react';
import { CelebrationOverlay } from './CelebrationOverlay';
import { useCelebration } from '@/hooks/useCelebration';
import BottomNav from './BottomNav';
import PillarTabs from './PillarTabs';
import EnergyModal from './EnergyModal';
import Mascot from './Mascot';
import AIRecipeCard from './AIRecipeCard';
import AIHealthInsights from './AIHealthInsights';
import AIExerciseCoach from './AIExerciseCoach';
import PreferencesModal from './PreferencesModal';
import FloatingMascot from './FloatingMascot';
import { useDragScroll } from '@/hooks/useDragScroll';
import MascotTutorial from './MascotTutorial';
import { TUTORIALS } from '@/lib/tutorials';
import { useTutorial, clearTutorialsSeen } from '@/hooks/useTutorial';
import DemPlusHabitInput from './DemPlusHabitInput';
import PantryTab from './PantryTab';
import WardrobeSelector from './WardrobeSelector';
import { getPantryForMeal } from '@/lib/pantry';

// ─── Mascot message pools ────────────────────────────────────────────────────────

const TICKLE_MESSAGES = [
  "That tickles! Hehe!",
  "Hey, I'm trying to focus here!",
  "Hehe, stop it!",
  "Okay okay okay I can't!",
];

const DIET_AI_MESSAGES = [
  "Mmm, sounds tasty!",
  "Ooh, I want some!",
  "That smells amazing from here!",
  "Fuel loaded. Let's go!",
  "Chef's kiss! Great pick.",
];

const EXERCISE_AI_MESSAGES = [
  "Time to get swole!",
  "Let's GOOO!",
  "Your body will thank you!",
  "Beast mode: activated.",
  "Gains incoming!",
];

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

interface PlanViewProps {
  onReset: () => void;
  onSignOut: () => void;
  authUserEmail: string;
  authUserName: string;
}

// ─── Main component ─────────────────────────────────────────────────────────────

export default function PlanView({ onReset, onSignOut, authUserEmail, authUserName }: PlanViewProps) {
  const [plan,            setPlan]           = useState<ThreeDayPlan | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const { triggerCelebration, celebrationProps, celebrationKey, dismissCelebration } = useCelebration();
  const [activeBottomTab, setActiveBottomTab] = useState<'plan' | 'account' | 'progress' | 'settings'>('plan');
  const [showPantrySheet, setShowPantrySheet] = useState(false);
  const [activePillar,    setActivePillar]    = useState<'diet' | 'exercise' | 'mentality'>('diet');
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [energySetMessage, setEnergySetMessage] = useState('');
  const [tickleMessage,   setTickleMessage]   = useState('');
  const [tabMessage,      setTabMessage]      = useState('');
  const [lastPillar,      setLastPillar]      = useState<'diet' | 'exercise' | 'mentality'>('diet');
  const [userName,        setUserName]        = useState('');
  const [userFoods,       setUserFoods]       = useState<string[]>([]);
  // Energy transition overlay
  const [showEnergyTransition, setShowEnergyTransition] = useState(false);
  const [transitionEnergy,     setTransitionEnergy]     = useState<EnergyLevel>('medium');
  // Streak goal selector (persistent on progress tab; warning modal for mid-plan change)
  const [showStreakChangeWarning, setShowStreakChangeWarning] = useState(false);
  const [pendingStreakLength,     setPendingStreakLength]     = useState<3 | 5 | 7 | 14 | 30 | null>(null);
  // Dev panel
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Preferences editing
  const [editingPrefs, setEditingPrefs] = useState<'diet' | 'exercise' | 'mentality' | null>(null);

  // Dev panel — visible by default in DEV_MODE, hidden in prod; Konami toggles it
  const [devUnlocked,  setDevUnlocked]  = useState(DEV_MODE);
  const konamiProgress = useRef(0);

  // Tutorials — one per context
  const homeTutorial           = useTutorial('home');
  const streakCompleteTutorial = useTutorial('streakComplete');
  const planExpiredTutorial    = useTutorial('planExpired');
  const dietTutorial           = useTutorial('diet');

  // Drag-to-scroll refs for horizontal scrollable containers
  const dayNavDrag      = useDragScroll();
  const overviewDrag    = useDragScroll();
  const exerciseTutorial = useTutorial('exercise');
  const mentalityTutorial = useTutorial('mentality');
  const progressTutorial = useTutorial('progress');

  useEffect(() => {
    const state = loadAppState();
    if (state.currentPlan) {
      setPlan(state.currentPlan);
      // In production: jump to the real-time active day. In dev: fall back to first incomplete.
      const realtimeIdx = getActiveDayIndex(state.currentPlan);
      // Always clamp to the real-time active day — users can never land on a future day.
      // Dev panel "Next Day" is the only way to advance in DEV_MODE.
      setCurrentDayIndex(realtimeIdx);
      if (state.user?.name)          setUserName(state.user.name);
      if (state.user?.selectedFoods) setUserFoods(state.user.selectedFoods);

      const day = state.currentPlan.days[realtimeIdx];
      if (!hasShownEnergyModal(day.dayNumber) && !(day.energyLocked ?? false)) {
        setTimeout(() => setShowEnergyModal(true), 600);
      }
    }

    // Konami code listener — active everywhere (hidden behind the sequence)
    const handleKonami = (e: KeyboardEvent) => {
      const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      if (e.key === seq[konamiProgress.current]) {
        konamiProgress.current += 1;
        if (konamiProgress.current === seq.length) {
          setDevUnlocked(v => !v); // toggle so it can be re-hidden
          konamiProgress.current = 0;
        }
      } else {
        konamiProgress.current = e.key === seq[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  }, []);

  // Background sync — every plan state change writes to Supabase (fire and forget).
  // Also updates longestStreak on the user profile if the current streak is a new high.
  useEffect(() => {
    if (!plan) return;
    syncPlan(plan).catch(() => {});
    const activeIdx      = getActiveDayIndex(plan);
    const gray           = plan.days.slice(0, activeIdx).some(d => !isDayComplete(d));
    const currentStreak  = (gray ? 0 : (plan.carryOverStreak ?? 0)) + calculateStreak(plan, activeIdx);
    const state          = loadAppState();
    if (state.user && currentStreak > (state.user.longestStreak ?? 0)) {
      const updatedUser = { ...state.user, longestStreak: currentStreak };
      saveUserProfile(updatedUser);
      syncUserProfile(updatedUser).catch(() => {});
    }
  }, [plan]);

  // Gray-day persistence: when a past day goes gray, persist carryOverStreak = 0 to
  // localStorage so handleStreakExtension reads the correct value. The UI already
  // uses effectiveCarryOver computed during render, so no setPlan needed here.
  useEffect(() => {
    if (!plan) return;
    const activeIdx = getActiveDayIndex(plan);
    const gray = plan.days.slice(0, activeIdx).some(d => !isDayComplete(d));
    if (gray && (plan.carryOverStreak ?? 0) !== 0) {
      saveCurrentPlan({ ...plan, carryOverStreak: 0 });
    }
  }, [plan]);

  // Auto-restart: when real calendar time has moved past the plan period, silently start
  // a fresh same-length plan. Handles both cases:
  //   A) Plan fully complete + day passed → restart with streak credit
  //   B) Plan expired but incomplete     → restart fresh, no streak credit
  useEffect(() => {
    if (!plan) return;

    // Raw (unclamped) diff so we can detect when the plan has expired (rawDiff >= planLength).
    const startStr  = plan.startDate ?? plan.createdAt;
    const startDate = new Date(startStr);
    const startDay  = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const today     = new Date();
    const todayDay  = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const rawDiff   = Math.floor((todayDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
    const planLen   = plan.planLength ?? 3;

    // Only fire once real time has passed the last plan day
    if (rawDiff < planLen) return;

    const state = loadAppState();
    if (!state.user) return;

    const allDone       = plan.days.every(d => isDayComplete(d));
    const completedDays = plan.days.filter(d => isDayComplete(d)).length;

    const newPlan = generatePlan(state.user, planLen);

    if (allDone) {
      // Fully completed plan — carry streak forward and credit a historical cycle
      newPlan.historicalStreak = (plan.historicalStreak ?? 0) + 1;
      newPlan.carryOverStreak  = (plan.carryOverStreak ?? 0) + completedDays;
      newPlan.dummyCurrency    = (plan.dummyCurrency ?? 0) + completedDays * 10;
    } else {
      // Expired but incomplete — start fresh, streak resets to 0
      newPlan.historicalStreak = plan.historicalStreak ?? 0;
      newPlan.carryOverStreak  = 0;
      newPlan.dummyCurrency    = plan.dummyCurrency ?? 0;
    }

    // Seed Day 1 energy from the last completed day, or the last day of the old plan
    const lastDoneDay = [...plan.days].reverse().find(d => isDayComplete(d));
    const energySource = lastDoneDay ?? plan.days[plan.days.length - 1];
    newPlan.days[0] = { ...newPlan.days[0], energyLevel: energySource.energyLevel };

    saveCurrentPlan(newPlan);
    setPlan(newPlan);
    setCurrentDayIndex(0);
  }, [plan]);

  // Mascot message on pillar tab change
  const getMascotTabMessage = (pillar: 'diet' | 'exercise' | 'mentality') => {
    if (pillar === 'diet')      return 'Fuel your body with foods you love!';
    if (pillar === 'exercise')  return 'Move your body, feel the energy!';
    return 'Your mind is the foundation. This matters most.';
  };

  useEffect(() => {
    if (activePillar !== lastPillar) {
      setTabMessage(getMascotTabMessage(activePillar));
      setLastPillar(activePillar);
      const t = setTimeout(() => setTabMessage(''), 5000);
      return () => clearTimeout(t);
    }
  }, [activePillar, lastPillar]);

  const handleDietAILoaded = () => {
    const msg = DIET_AI_MESSAGES[Math.floor(Math.random() * DIET_AI_MESSAGES.length)];
    setEnergySetMessage(msg);
    setTimeout(() => setEnergySetMessage(''), 4000);
  };

  const handleExerciseAILoaded = () => {
    const msg = EXERCISE_AI_MESSAGES[Math.floor(Math.random() * EXERCISE_AI_MESSAGES.length)];
    setEnergySetMessage(msg);
    setTimeout(() => setEnergySetMessage(''), 4000);
  };

  if (!plan) return <div className="p-4 text-center text-gray-400 pt-20">Loading...</div>;

  const currentDay   = plan.days[currentDayIndex];
  const activeDayIdx = getActiveDayIndex(plan);
  // If any past day is gray (missed), the carry-over from previous plans is forfeit.
  // Compute this inline during render — never rely on an effect to update it first,
  // which avoids any timing window where the displayed streak shows a stale value.
  const hasGrayDay      = plan.days.slice(0, activeDayIdx).some(d => !isDayComplete(d));
  const effectiveCarryOver = hasGrayDay ? 0 : (plan.carryOverStreak ?? 0);
  const streak          = effectiveCarryOver + calculateStreak(plan, activeDayIdx);
  const isComplete   = isDayComplete(currentDay);
  const theme        = ENERGY_THEME[currentDay.energyLevel];
  // Past days are view-only: user can navigate back but not interact
  const isPastDay       = currentDayIndex < activeDayIdx;
  const allDaysComplete = plan.days.every(d => isDayComplete(d));
  // Plan expired = real time has passed last day but plan was never fully completed
  const planExpired     = !allDaysComplete && activeDayIdx >= (plan.planLength ?? 3) - 1 && activeDayIdx > 0;

  // Handlers

  const handleEnergySelect = (energy: EnergyLevel) => {
    setShowEnergyModal(false);
    if (isPastDay) return;
    if (currentDay.energyLocked ?? false) return; // locked after day completion

    const state = loadAppState();
    if (!state.user || !state.currentPlan) return;

    const regenerated = regenerateDayForEnergy(state.currentPlan, currentDayIndex, energy, state.user);
    saveCurrentPlan(regenerated);
    setPlan(regenerated);
    saveEnergyModalShown(regenerated.days[currentDayIndex].dayNumber);

    setTransitionEnergy(energy);
    setShowEnergyTransition(true);
    setTimeout(() => setShowEnergyTransition(false), 1800);

    setEnergySetMessage(`${ENERGY_THEME[energy].label} set! Tap me anytime to change.`);
    setTimeout(() => setEnergySetMessage(''), 8000);
  };

  const toggleTask = (pillar: 'diet' | 'exercise' | 'mentality') => {
    // Past days and already-checked pillars are immutable
    if (isPastDay) return;
    if (currentDay.completed[pillar]) return;
    const wasComplete = isComplete;

    // Build updated plan directly — don't re-read from localStorage to avoid race conditions
    const updatedDays = [...plan.days];
    updatedDays[currentDayIndex] = {
      ...updatedDays[currentDayIndex],
      completed: { ...updatedDays[currentDayIndex].completed, [pillar]: true },
    };
    if (isDayComplete(updatedDays[currentDayIndex]) && !wasComplete) {
      updatedDays[currentDayIndex] = { ...updatedDays[currentDayIndex], energyLocked: true };
    }
    const updatedPlan = { ...plan, days: updatedDays };

    // Persist then set React state from the same object — no localStorage round-trip
    saveCurrentPlan(updatedPlan);
    setPlan(updatedPlan);

    const nowComplete = isDayComplete(updatedDays[currentDayIndex]);
    if (nowComplete && !wasComplete) {
      const prevDone = currentDayIndex === 0 || isDayComplete(updatedDays[currentDayIndex - 1]);
      if (prevDone) {
        // Compute updated streak to decide celebration type
        const gray       = updatedPlan.days.slice(0, activeDayIdx).some(d => !isDayComplete(d));
        const newStreak  = (gray ? 0 : (updatedPlan.carryOverStreak ?? 0)) + calculateStreak(updatedPlan, activeDayIdx);
        const MILESTONES = [3, 7, 30];
        if (MILESTONES.includes(newStreak)) {
          const nextMilestone = [7, 30, 50, 100].find(m => m > newStreak) ?? 100;
          triggerCelebration({ type: 'streak_milestone', streakCount: newStreak, nextMilestone });
        } else {
          triggerCelebration({ type: 'tasks_complete' });
        }
      }
    }
  };

  const handleDayChange = (dayIdx: number) => {
    if (dayIdx > getActiveDayIndex(plan)) return; // future days are locked
    commitDayChange(dayIdx);
  };

  const commitDayChange = (dayIdx: number) => {
    setCurrentDayIndex(dayIdx);
    const dayNumber = plan.days[dayIdx].dayNumber;
    // Only show energy modal for the current active day, not past days
    const isActiveDayOrLater = dayIdx >= getActiveDayIndex(plan);
    if (isActiveDayOrLater && !hasShownEnergyModal(dayNumber) && !isDayComplete(plan.days[dayIdx])) {
      setTimeout(() => setShowEnergyModal(true), 300);
    }
  };

  const handleReset = () => {
    if (confirm('Start over? This will clear your current progress.')) {
      clearAppState();
      clearTutorialsSeen().catch(() => {});
      deactivateCloudPlan().catch(() => {}); // so bootstrap routes to onboarding on reload
      onReset();
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Permanently delete your account? All your data will be removed. This cannot be undone.')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const res = await fetch('/api/delete-account', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Delete failed');
      }
      clearAppState();
      clearTutorialsSeen().catch(() => {});
      onSignOut();
    } catch {
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleStreakExtension = (newLength: 3 | 5 | 7 | 14 | 30) => {
    const state = loadAppState();
    if (!state.user) return;

    // Displayed streak BEFORE the switch — use same gray-day-aware formula as render
    const gray = plan.days.slice(0, activeDayIdx).some(d => !isDayComplete(d));
    const displayedStreak = (gray ? 0 : (plan.carryOverStreak ?? 0)) + calculateStreak(plan, activeDayIdx);
    // Use the real active day from the old plan (not the UI-selected day)
    const activeDay     = plan.days[activeDayIdx];
    const activeDayDone = isDayComplete(activeDay);

    const newPlan = generatePlan(state.user, newLength);
    newPlan.historicalStreak = (plan.historicalStreak ?? 0) + 1;
    newPlan.dummyCurrency    = (plan.dummyCurrency ?? 0) + displayedStreak * 10;

    // Transfer current active day's partial/full progress + energy to Day 1
    newPlan.days[0] = {
      ...newPlan.days[0],
      energyLevel:  activeDay.energyLevel,
      completed:    { ...activeDay.completed },
      energyLocked: activeDayDone,
    };

    // Keep displayed streak unchanged after the switch:
    //   If active day WAS done: calculateStreak(newPlan) = 1, so carryOver = displayedStreak - 1
    //   If active day NOT done: calculateStreak(newPlan) = 0, so carryOver = displayedStreak
    // This prevents the streak from jumping by 1 just because you switched plans.
    newPlan.carryOverStreak = activeDayDone
      ? Math.max(0, displayedStreak - 1)
      : displayedStreak;

    saveCurrentPlan(newPlan);
    setPlan(newPlan);
    setCurrentDayIndex(0);
  };

  // Called from progress tab streak goal selector
  const handleStreakGoalChange = (newLength: 3 | 5 | 7 | 14 | 30) => {
    const allDone    = plan.days.every(d => isDayComplete(d));
    const expired    = !allDone && activeDayIdx >= (plan.planLength ?? 3) - 1 && activeDayIdx > 0;
    if (allDone || expired) {
      // Plan complete or expired — start fresh (same length allowed, no streak credit for expired)
      handleStreakExtension(newLength);
    } else {
      // Mid-plan change — warn and restart
      if ((plan.planLength ?? 3) === newLength) return; // same length mid-plan is a no-op
      setPendingStreakLength(newLength);
      setShowStreakChangeWarning(true);
    }
  };

  // Dev-only quick actions
  const handleDevAction = (action: 'next' | 'complete' | 'reset') => {
    if (action === 'next') {
      const allDone = plan.days.every(d => isDayComplete(d));
      const onLastDay = currentDayIndex >= plan.days.length - 1;
      // On last day: restart regardless of completion. Only credit streak when all done.
      if (onLastDay) {
        const state = loadAppState();
        if (!state.user) return;
        const newPlan = generatePlan(state.user, plan.planLength ?? 3);
        if (allDone) {
          const completedDays = plan.days.filter(d => isDayComplete(d)).length;
          newPlan.historicalStreak = (plan.historicalStreak ?? 0) + 1;
          newPlan.carryOverStreak  = (plan.carryOverStreak ?? 0) + completedDays;
          newPlan.dummyCurrency    = (plan.dummyCurrency ?? 0) + completedDays * 10;
        } else {
          newPlan.historicalStreak = plan.historicalStreak ?? 0;
          newPlan.carryOverStreak  = 0;
          newPlan.dummyCurrency    = plan.dummyCurrency ?? 0;
        }
        newPlan.days[0] = { ...newPlan.days[0], energyLevel: currentDay.energyLevel };
        saveCurrentPlan(newPlan);
        setPlan(newPlan);
        setCurrentDayIndex(0);
        return;
      }
      // Rewind startDate by 1 day so getActiveDayIndex() persists correctly on reload
      const targetIdx = Math.min(currentDayIndex + 1, plan.days.length - 1);
      const today = new Date();
      const newStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - targetIdx);
      updatePlan(p => ({ ...p, startDate: newStart.toISOString() }));
      const s = loadAppState();
      if (s.currentPlan) setPlan(s.currentPlan);
      setCurrentDayIndex(targetIdx);
    } else if (action === 'complete') {
      updatePlan(p => {
        const updated = { ...p, days: [...p.days] };
        updated.days[currentDayIndex] = {
          ...updated.days[currentDayIndex],
          completed: { diet: true, exercise: true, mentality: true },
          energyLocked: true,
        };
        return updated;
      });
      const s = loadAppState();
      if (s.currentPlan) setPlan(s.currentPlan);
    } else if (action === 'reset') {
      updatePlan(p => {
        const updated = { ...p, days: [...p.days] };
        updated.days[currentDayIndex] = {
          ...updated.days[currentDayIndex],
          completed: { diet: false, exercise: false, mentality: false },
          energyLocked: false,
        };
        return updated;
      });
      const s = loadAppState();
      if (s.currentPlan) setPlan(s.currentPlan);
    }
    setShowDevPanel(false);
  };


  // ── Account tab ──────────────────────────────────────────────────────────

  if (activeBottomTab === 'account') {
    const displayInitial  = (authUserName || authUserEmail || 'D')[0].toUpperCase();
    const longestStreak   = loadAppState().user?.longestStreak ?? 0;
    return (
      <EnergyBackground energy={currentDay.energyLevel}>
        <div className="min-h-screen pb-24 p-4">
          <div className="pt-8 space-y-4">

            {/* Profile card */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{ background: theme.accent }}
                >
                  {displayInitial}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-gray-900 text-base truncate">
                    {authUserName || userName || 'Dem User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{authUserEmail}</p>
                </div>
              </div>
              <div
                className="rounded-xl px-3 py-2 mb-4 text-xs font-semibold text-center"
                style={{ background: theme.accentLight, color: theme.accentText }}
              >
                Progress synced to your account
              </div>

              {/* Stats row */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}>
                  <div className="text-2xl font-black" style={{ color: theme.accent }}>{streak}</div>
                  <div className="text-[11px] text-gray-400 font-semibold mt-0.5">Current Streak</div>
                </div>
                <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}>
                  <div className="text-2xl font-black" style={{ color: theme.accent }}>{longestStreak}</div>
                  <div className="text-[11px] text-gray-400 font-semibold mt-0.5">Longest Streak</div>
                </div>
              </div>

              <Button variant="ghost" onClick={onSignOut} className="w-full text-gray-500">
                Sign Out
              </Button>
            </Card>

          </div>

          <FloatingMascot
            energy={currentDay.energyLevel}
            userName={userName}
            firstVisitMessage={`Hey ${userName || 'friend'}! This is your account page.`}
          />
          <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} accentColor={theme.accent} />
          <DevPanel show={showDevPanel} onToggle={() => setShowDevPanel(v => !v)} onAction={handleDevAction} devUnlocked={devUnlocked} />
        </div>
      </EnergyBackground>
    );
  }

  // ── Settings tab ─────────────────────────────────────────────────────────

  if (activeBottomTab === 'settings') {
    const habitValue = loadAppState().user?.demPlusHabit ?? '';
    return (
      <EnergyBackground energy={currentDay.energyLevel}>
        <div className="min-h-screen pb-24 p-4">
          <div className="pt-8 space-y-4">

            {/* Dem+ Habit */}
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-black text-gray-900">Dem+</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: theme.accentLight, color: theme.accentText }}>Habit</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">One habit. Every day. That&apos;s all it takes.</p>
              <DemPlusHabitInput
                initialValue={habitValue}
                accentColor={theme.accent}
                accentDark={theme.accentDark}
                onSave={(habit) => {
                  const state = loadAppState();
                  if (!state.user) return;
                  const updated = { ...state.user, demPlusHabit: habit };
                  saveUserProfile(updated);
                  syncUserProfile(updated);
                }}
              />
            </Card>

            {/* Account settings — name/password change (coming soon) */}
            <Card>
              <h3 className="font-black text-gray-800 text-base mb-4">Account Settings</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">
                    Display Name
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      disabled
                      defaultValue={authUserName || userName || ''}
                      placeholder="Your name"
                      className="flex-1 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-2 border-gray-100 outline-none"
                    />
                    <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap">Coming soon</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">
                    Password
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      disabled
                      type="password"
                      defaultValue="••••••••"
                      className="flex-1 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-2 border-gray-100 outline-none"
                    />
                    <span className="text-[10px] font-bold text-gray-300 whitespace-nowrap">Coming soon</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Mascot Wardrobe */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-black text-gray-900">Wardrobe</span>
                <span className="text-xs text-gray-400">Dress up your Mascot</span>
              </div>
              <WardrobeSelector
                currentHat={loadAppState().user?.mascotItems?.[0] ?? ''}
                accentColor={theme.accent}
                accentLight={theme.accentLight}
                accentText={theme.accentText}
                onSelect={(hatId) => {
                  const state = loadAppState();
                  if (!state.user) return;
                  const updated = { ...state.user, mascotItems: hatId ? [hatId] : [] };
                  saveUserProfile(updated);
                  syncUserProfile(updated);
                }}
              />
            </Card>

            {/* Danger zone */}
            <Card>
              <h3 className="font-black text-gray-700 text-sm mb-1">Danger Zone</h3>
              <p className="text-xs text-gray-400 mb-4">These actions cannot be undone.</p>

              <div className="space-y-2">
                <Button variant="ghost" onClick={handleReset} className="w-full text-red-500">
                  <RotateCcw className="w-4 h-4 mr-2 inline" />
                  Reset All Progress
                </Button>
                <Button variant="ghost" onClick={handleDeleteAccount} className="w-full text-red-600 font-black">
                  Delete Account
                </Button>
              </div>
            </Card>

          </div>

          <FloatingMascot
            energy={currentDay.energyLevel}
            userName={userName}
            firstVisitMessage={`Settings live here. Tap the gear anytime.`}
          />
          <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} accentColor={theme.accent} />
          <DevPanel show={showDevPanel} onToggle={() => setShowDevPanel(v => !v)} onAction={handleDevAction} devUnlocked={devUnlocked} />
        </div>
      </EnergyBackground>
    );
  }

  // ── Progress tab ─────────────────────────────────────────────────────────

  if (activeBottomTab === 'progress') {
    const energyHistory     = plan.days.map(d => d.energyLevel);
    const completionHistory = plan.days.map(d => d.completed);
    const planLength         = plan.planLength ?? 3;
    // Streak goal selector unlocks after first full streak, or when plan is done/expired
    const streakGoalUnlocked = (plan.historicalStreak ?? 0) > 0 || allDaysComplete || planExpired;

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
                <Flame className="w-10 h-10" style={{ color: planExpired ? '#9ca3af' : theme.accent }} />
                <span className="text-6xl font-black" style={{ color: planExpired ? '#9ca3af' : theme.accent }}>{streak}</span>
              </motion.div>
              <p className="font-black text-gray-800 text-lg">Day Streak</p>
              <p className="text-gray-500 text-sm mt-1">
                {planExpired
                  ? "It's okay to be inconsistent at the start — showing up is the first step."
                  : streak === 0
                  ? 'Complete today to start your streak!'
                  : `${streak} day${streak !== 1 ? 's' : ''} completed, amazing work!`}
              </p>
            </Card>

            {/* Day completion overview — scrollable for long plans */}
            <Card className="mb-4">
              <h3 className="font-black text-gray-800 mb-3 text-base">{planLength}-Day Overview</h3>
              <div
                ref={overviewDrag.ref}
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
                onMouseDown={overviewDrag.onMouseDown}
                onMouseMove={overviewDrag.onMouseMove}
                onMouseUp={overviewDrag.onMouseUp}
                onMouseLeave={overviewDrag.onMouseLeave}
              >
                {plan.days.map((day, idx) => {
                  const done  = isDayComplete(day);
                  const isNow = idx === currentDayIndex;
                  return (
                    <div
                      key={idx}
                      className="flex-shrink-0 rounded-2xl p-2.5 text-center"
                      style={{
                        width:      planLength <= 5 ? undefined : 64,
                        flex:       planLength <= 5 ? '1 0 auto' : 'none',
                        background: done ? theme.accentLight : isNow ? `${theme.accent}11` : '#f9fafb',
                        border:     `2px solid ${done ? theme.accent : isNow ? `${theme.accent}44` : '#e5e7eb'}`,
                      }}
                    >
                      <div className="flex justify-center mb-0.5">
                        {done ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: theme.accent }} />
                        ) : isNow ? (
                          <Eye className="w-5 h-5" style={{ color: theme.accent }} />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="text-[11px] font-black text-gray-700">Day {day.dayNumber}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{day.energyLevel}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Persistent streak goal selector — locked until first 3-day streak done */}
            <Card className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-gray-800 text-base">Streak Goal</h3>
                {allDaysComplete && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ background: theme.accentLight, color: theme.accentText }}
                  >
                    Plan Complete! <Trophy className="w-3.5 h-3.5 inline ml-0.5 mb-0.5" />
                  </motion.span>
                )}
              </div>
              {streakGoalUnlocked ? (
                <>
                  <div className="flex gap-1.5">
                    {([3, 5, 7, 14, 30] as const).map(days => {
                      const isCurrent = planLength === days;
                      return (
                        <motion.button
                          key={days}
                          onClick={() => handleStreakGoalChange(days)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-black"
                          style={{
                            background: isCurrent ? theme.accent : '#f3f4f6',
                            color:      isCurrent ? 'white' : '#6b7280',
                            boxShadow:  isCurrent ? `0 3px 0 0 ${theme.accentDark}` : '0 2px 0 0 #d1d5db',
                          }}
                          whileTap={{ scale: 0.95, y: 2, boxShadow: 'none' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          {days}d
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 text-center">
                    {allDaysComplete
                      ? 'Tap a length to begin your next streak!'
                      : planExpired
                      ? 'Choose a plan length to start fresh — same or longer!'
                      : 'Changing mid-plan will restart your current progress.'}
                  </p>
                </>
              ) : (
                <div
                  className="rounded-2xl px-4 py-3 text-center"
                  style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}
                >
                  <Lock className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                  <p className="text-sm font-black text-gray-600">Complete your first 3-day streak to unlock longer goals!</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {plan.days.filter(d => isDayComplete(d)).length} / 3 days done
                  </p>
                </div>
              )}
            </Card>

            {/* Streak goal change warning modal */}
            <AnimatePresence>
              {showStreakChangeWarning && pendingStreakLength !== null && (
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
                        Switch to {pendingStreakLength} days?
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Your current plan progress will reset and a new {pendingStreakLength}-day plan will start.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => { setShowStreakChangeWarning(false); setPendingStreakLength(null); }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          handleStreakExtension(pendingStreakLength!);
                          setShowStreakChangeWarning(false);
                          setPendingStreakLength(null);
                        }}
                        className="flex-1"
                        energyColor={theme.accent}
                      >
                        Restart &amp; Change
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

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
            firstVisitMessage={`Hey ${userName || 'friend'}! This is your Progress tab. Track your streak and get your AI health summary here.`}
          />
          <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} accentColor={theme.accent} />
          <AnimatePresence>
            {progressTutorial.shouldShow && (
              <MascotTutorial key="tut-progress" slides={TUTORIALS.progress} onDismiss={progressTutorial.dismiss} />
            )}
          </AnimatePresence>

          {/* Accountabuddies */}
          <AccountabuddiesCard
            habit={loadAppState().user?.demPlusHabit ?? ''}
            name={userName}
            accentColor={theme.accent}
            accentDark={theme.accentDark}
            accentLight={theme.accentLight}
            accentText={theme.accentText}
          />

          <DevPanel show={showDevPanel} onToggle={() => setShowDevPanel(v => !v)} onAction={handleDevAction} devUnlocked={devUnlocked} />
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

      <div className="min-h-screen pb-24 px-4">
        {/* Header */}
        <div className="flex justify-between items-center pt-5 mb-4">
          <div>
            <motion.h1
              className="text-3xl font-black"
              animate={{ color: theme.accent }}
              transition={{ duration: 0.6 }}
            >
              Dem V2
            </motion.h1>
            <p className="text-sm text-gray-500 font-semibold">Day {currentDay.dayNumber} of {plan.planLength ?? 3}</p>
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

        {/* Day navigator — horizontal scroll for long plans */}
        <div
          ref={dayNavDrag.ref}
          className="flex gap-2 mb-5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          onMouseDown={dayNavDrag.onMouseDown}
          onMouseMove={dayNavDrag.onMouseMove}
          onMouseUp={dayNavDrag.onMouseUp}
          onMouseLeave={dayNavDrag.onMouseLeave}
        >
          {plan.days.map((day, idx) => {
            const done           = isDayComplete(day);
            const isCurrent      = idx === currentDayIndex;
            const isFuture       = idx > activeDayIdx;
            const isPast         = idx < activeDayIdx;
            // White dot = skipped past day (started but not completed)
            const dotColor       = (!done && isPast) ? '#ffffff' : ENERGY_CONFIG[day.energyLevel].color;
            const dotBorderColor = (!done && isPast) ? '#d1d5db' : 'white';
            const numDays        = plan.days.length;
            // Scale falls off with distance from selected day — visual depth effect
            const dist           = Math.abs(idx - currentDayIndex);
            const navScale       = dist === 0 ? 1 : dist === 1 ? 0.92 : 0.84;
            return (
              <motion.button
                key={idx}
                onClick={() => handleDayChange(idx)}
                disabled={isFuture}
                className="relative rounded-2xl py-3 flex flex-col items-center gap-1 flex-shrink-0"
                animate={{ scale: navScale }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={{
                  // ≤7 days: flex-1 fills row evenly; 8+ days: fixed width for horizontal scroll
                  width:  numDays > 7 ? 60 : undefined,
                  flex:   numDays <= 7 ? '1 0 auto' : 'none',
                  minWidth: numDays <= 7 ? 0 : 60,
                  background: isCurrent ? theme.accent
                    : done    ? `${theme.accent}22`
                    : '#f3f4f6',
                  boxShadow: isCurrent
                    ? `0 4px 0 0 ${theme.accentDark}66, 0 2px 8px ${theme.accent}33`
                    : `0 2px 0 0 #d1d5db`,
                  opacity: isFuture ? 0.4 : 1,
                }}
                whileTap={isFuture ? {} : { scale: navScale * 0.95, y: 2 }}
              >
                {done ? (
                  <Check className="w-5 h-5" style={{ color: isCurrent ? 'white' : theme.accentDark }} />
                ) : isFuture ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : (
                  <span className="text-xl font-black" style={{ color: isCurrent ? 'white' : '#6b7280' }}>
                    {idx + 1}
                  </span>
                )}
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isCurrent ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}
                >
                  Day {idx + 1}
                </span>
                {/* Energy dot — hidden for future days; white for past skipped days */}
                {!isFuture && (
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                    style={{ background: dotColor, borderColor: dotBorderColor }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Past day banner / Day complete banner */}
        <AnimatePresence>
          {isPastDay && !isComplete && (
            <motion.div
              key="past-day"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="rounded-3xl mb-4 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}
            >
              <div className="p-4 text-center text-white">
                <CalendarDays className="w-8 h-8 mx-auto mb-1 text-white" />
                <p className="font-black text-lg">Day {currentDay.dayNumber} Has Passed</p>
                <p className="text-sm opacity-85">This day is view-only. Skipped days don't count toward your streak.</p>
              </div>
            </motion.div>
          )}
          {isPastDay && isComplete && (
            <motion.div
              key="past-complete"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="rounded-3xl mb-4 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
            >
              <div className="p-4 text-center text-white">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-white" />
                <p className="font-black text-lg">Day {currentDay.dayNumber} — Completed!</p>
                <p className="text-sm opacity-85">You crushed this day. View-only now.</p>
              </div>
            </motion.div>
          )}
          {!isPastDay && isComplete && (
            <motion.div
              key="complete"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="rounded-3xl mb-4 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})` }}
            >
              <div className="p-4 text-center text-white">
                <Sparkles className="w-8 h-8 mx-auto mb-1 text-white" />
                <p className="font-black text-lg">Day {currentDay.dayNumber} Complete!</p>
                <p className="text-sm opacity-85">You're absolutely crushing it!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot — clickable to open energy modal, or tickle when day is complete */}
        <motion.div
          className="flex justify-center mb-4 cursor-pointer"
          onClick={() => {
            if (isComplete) {
              const msg = TICKLE_MESSAGES[Math.floor(Math.random() * TICKLE_MESSAGES.length)];
              setTickleMessage(msg);
              setTimeout(() => setTickleMessage(''), 3000);
            } else if (!isPastDay && !(currentDay.energyLocked ?? false)) {
              setShowEnergyModal(true);
            }
          }}
          whileHover={{ scale: isPastDay ? 1 : 1.03 }}
          whileTap={{ scale: isPastDay ? 1 : 0.97 }}
          title={isPastDay ? 'Past day — view only' : isComplete ? 'Hehe!' : (currentDay.energyLocked ?? false) ? 'Day complete, energy locked' : 'Tap to change energy level'}
        >
          <Mascot
            key={activePillar}
            message={tickleMessage || energySetMessage || tabMessage}
            mood={activePillar === 'mentality' ? 'encouraging' : currentDay.energyLevel === 'high' ? 'excited' : 'happy'}
            persistent={false}
            currentEnergy={currentDay.energyLevel}
            userName={userName}
            dayNumber={currentDay.dayNumber}
            completedTasks={Object.entries(currentDay.completed).filter(([, v]) => v).map(([k]) => k)}
            streak={streak}
            pillar={activePillar}
            size={96}
            hat={loadAppState().user?.mascotItems?.[0]}
          />
        </motion.div>

        {/* Dem+ habit bubble */}
        {(() => {
          const habit = loadAppState().user?.demPlusHabit;
          return habit ? (
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm"
                style={{ background: 'white', border: `1.5px solid ${theme.accent}33`, color: theme.accentText }}>
                <span>🎯</span>
                <span className="max-w-[220px] truncate">{habit}</span>
              </div>
            </div>
          ) : null;
        })()}

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
                isPastDay={isPastDay}
                onEditPrefs={() => setEditingPrefs('diet')}
                onAILoaded={handleDietAILoaded}
                pantryBreakfast={getPantryForMeal('breakfast')}
                pantryLunch={getPantryForMeal('lunch')}
                pantryDinner={getPantryForMeal('dinner')}
                pantrySnack={getPantryForMeal('snack')}
                onOpenPantry={() => setShowPantrySheet(true)}
              />
            )}
            {activePillar === 'exercise' && (
              <ExerciseView
                day={currentDay}
                isCompleted={currentDay.completed.exercise}
                onToggle={() => toggleTask('exercise')}
                onEditPrefs={() => setEditingPrefs('exercise')}
                isPastDay={isPastDay}
                onAILoaded={handleExerciseAILoaded}
              />
            )}
            {activePillar === 'mentality' && (
              <MentalityView
                day={currentDay}
                isCompleted={currentDay.completed.mentality}
                onToggle={() => toggleTask('mentality')}
                onEditPrefs={() => setEditingPrefs('mentality')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} accentColor={theme.accent} />

      {/* Celebration overlay */}
      {celebrationProps && (
        <CelebrationOverlay
          key={celebrationKey}
          {...celebrationProps}
          onDismiss={dismissCelebration}
        />
      )}
      <DevPanel show={showDevPanel} onToggle={() => setShowDevPanel(v => !v)} onAction={handleDevAction} devUnlocked={devUnlocked} />

      {/* Pantry sheet — triggered by basket button in DietView header */}
      <AnimatePresence>
        {showPantrySheet && (
          <motion.div
            className="fixed inset-0 z-[170] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPantrySheet(false)}
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
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-black text-gray-900">🧺 Pantry</h2>
                <button onClick={() => setShowPantrySheet(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <XIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                <PantryTab
                  accentColor={theme.accent}
                  accentDark={theme.accentDark}
                  accentLight={theme.accentLight}
                  accentText={theme.accentText}
                  inSheet
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences edit modal */}
      <AnimatePresence>
        {editingPrefs && (
          <PreferencesModal
            key={editingPrefs}
            pillar={editingPrefs}
            onClose={() => setEditingPrefs(null)}
            onSaved={(newPlan) => {
              const s = loadAppState();
              if (s.user) syncUserProfile(s.user).catch(() => {});
              setPlan(newPlan);
              setEditingPrefs(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Mascot tutorials — shown once ever, keys required by AnimatePresence */}
      <AnimatePresence>
        {homeTutorial.shouldShow ? (
          <MascotTutorial key="tut-home" slides={TUTORIALS.home} onDismiss={homeTutorial.dismiss} />
        ) : allDaysComplete && streakCompleteTutorial.shouldShow ? (
          <MascotTutorial key="tut-streak-complete" slides={TUTORIALS.streakComplete} onDismiss={streakCompleteTutorial.dismiss} />
        ) : planExpired && planExpiredTutorial.shouldShow ? (
          <MascotTutorial key="tut-plan-expired" slides={TUTORIALS.planExpired} onDismiss={planExpiredTutorial.dismiss} />
        ) : activePillar === 'diet' && dietTutorial.shouldShow ? (
          <MascotTutorial key="tut-diet" slides={TUTORIALS.diet} onDismiss={dietTutorial.dismiss} />
        ) : activePillar === 'exercise' && exerciseTutorial.shouldShow ? (
          <MascotTutorial key="tut-exercise" slides={TUTORIALS.exercise} onDismiss={exerciseTutorial.dismiss} />
        ) : activePillar === 'mentality' && mentalityTutorial.shouldShow ? (
          <MascotTutorial key="tut-mentality" slides={TUTORIALS.mentality} onDismiss={mentalityTutorial.dismiss} />
        ) : null}
      </AnimatePresence>

    </EnergyBackground>
  );
}

// ─── Accountabuddies card ────────────────────────────────────────────────────────

function AccountabuddiesCard({
  habit, name, accentColor, accentDark, accentLight, accentText,
}: {
  habit: string; name: string;
  accentColor: string; accentDark: string; accentLight: string; accentText: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!habit) {
    return (
      <Card>
        <p className="font-black text-gray-900 text-sm mb-1">🤝 Accountabuddies</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Set a habit in Settings to get a shareable buddy link. Keep each other on track!
        </p>
      </Card>
    );
  }

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/buddy?habit=${encodeURIComponent(habit)}&name=${encodeURIComponent(name || 'A friend')}`
    : '';

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card>
      <p className="font-black text-gray-900 text-sm mb-1">🤝 Accountabuddies</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        Share this link with someone to build <span className="font-bold">&ldquo;{habit}&rdquo;</span> together.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 rounded-xl px-3 py-2 bg-gray-50 border border-gray-200 text-xs text-gray-400 font-mono truncate">
          {link}
        </div>
        <motion.button
          onClick={copy}
          className="px-3 py-2 rounded-xl text-xs font-black text-white flex-shrink-0"
          style={{ background: copied ? '#16a34a' : accentColor, boxShadow: `0 3px 0 0 ${accentDark}` }}
          whileTap={{ scale: 0.92, y: 1, boxShadow: 'none' }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </motion.button>
      </div>
    </Card>
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

// ─── Dev panel (DEV_MODE only) ──────────────────────────────────────────────────

function DevPanel({
  show, onToggle, onAction, devUnlocked,
}: {
  show: boolean;
  onToggle: () => void;
  onAction: (a: 'next' | 'complete' | 'reset') => void;
  devUnlocked: boolean;
}) {
  if (!devUnlocked) return null;
  return (
    <>
      <motion.button
        className="fixed bottom-24 right-4 z-[120] w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: '#1f2937' }}
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        title="Dev tools"
      >
        <Wrench className="w-5 h-5 text-yellow-400" />
      </motion.button>
      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed bottom-40 right-4 z-[120] bg-gray-900 rounded-2xl p-3 shadow-2xl w-44 space-y-2"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
          >
            <p className="text-yellow-400 text-xs font-black mb-1">DEV TOOLS</p>
            <button onClick={() => onAction('next')}
              className="w-full text-left text-white text-xs py-1.5 px-2 rounded-lg hover:bg-gray-700">
              Next Day
            </button>
            <button onClick={() => onAction('complete')}
              className="w-full text-left text-white text-xs py-1.5 px-2 rounded-lg hover:bg-gray-700">
              Fast-complete Day
            </button>
            <button onClick={() => onAction('reset')}
              className="w-full text-left text-white text-xs py-1.5 px-2 rounded-lg hover:bg-gray-700">
              Reset Day Tasks
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Diet view ───────────────────────────────────────────────────────────────────

function DietView({ day, isCompleted, onToggle, userName, userFoods, accentColor, onEditPrefs, isPastDay, onAILoaded,
  pantryBreakfast = [], pantryLunch = [], pantryDinner = [], pantrySnack = [], onOpenPantry,
}: {
  day: DayPlan; isCompleted: boolean; onToggle: () => void;
  userName?: string; userFoods: string[]; accentColor: string; onEditPrefs: () => void;
  isPastDay?: boolean; onAILoaded?: () => void;
  pantryBreakfast?: string[]; pantryLunch?: string[]; pantryDinner?: string[]; pantrySnack?: string[];
  onOpenPantry?: () => void;
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
            <button
              onClick={onEditPrefs}
              className="ml-1 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Edit food preferences"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm font-semibold" style={{ color: accentColor }}>{day.diet.focus}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onOpenPantry}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Open pantry"
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingBasket className="w-4 h-4" />
          </motion.button>
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
      </div>

      <MealSectionShuffleable title="Breakfast" items={meals.breakfast} pantryItems={pantryBreakfast} Icon={Sunrise}
        mealKey="breakfast" spinning={spinning === 'breakfast'} onShuffle={() => shuffleMeal('breakfast')}
        dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} isPastDay={isPastDay} onAILoaded={onAILoaded} accentColor={accentColor} />
      <MealSectionShuffleable title="Lunch" items={meals.lunch} pantryItems={pantryLunch} Icon={Sun}
        mealKey="lunch" spinning={spinning === 'lunch'} onShuffle={() => shuffleMeal('lunch')}
        dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} isPastDay={isPastDay} onAILoaded={onAILoaded} accentColor={accentColor} />
      <MealSectionShuffleable title="Dinner" items={meals.dinner} pantryItems={pantryDinner} Icon={Moon}
        mealKey="dinner" spinning={spinning === 'dinner'} onShuffle={() => shuffleMeal('dinner')}
        dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} isPastDay={isPastDay} onAILoaded={onAILoaded} accentColor={accentColor} />
      {(meals.snack && meals.snack.length > 0 || pantrySnack.length > 0) && (
        <MealSectionShuffleable title="Snack" items={meals.snack ?? []} pantryItems={pantrySnack} Icon={Coffee}
          mealKey="snack" spinning={spinning === 'snack'} onShuffle={() => shuffleMeal('snack')}
          dayNumber={day.dayNumber} energyLevel={day.energyLevel} userName={userName} isPastDay={isPastDay} onAILoaded={onAILoaded} accentColor={accentColor} />
      )}
    </Card>
  );
}

function MealSectionShuffleable({ title, items, pantryItems = [], Icon, mealKey, spinning, onShuffle, dayNumber, energyLevel, userName, isPastDay, onAILoaded, accentColor }: {
  title: string; items: string[]; pantryItems?: string[]; Icon: LucideIcon;
  mealKey: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  spinning: boolean; onShuffle: () => void;
  isPastDay?: boolean; onAILoaded?: () => void;
  dayNumber: number; energyLevel: EnergyLevel; userName?: string; accentColor?: string;
}) {
  const allFoods = [...(items ?? []), ...pantryItems];
  return (
    <div className="mb-3">
      <AIRecipeCard foods={allFoods} mealType={mealKey}
        energyLevel={energyLevel} dayNumber={dayNumber} userName={userName} locked={isPastDay} onLoaded={onAILoaded} />
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
          {pantryItems.map((item, idx) => (
            <span key={`pantry-${idx}`}
              className="text-sm px-3 py-1 rounded-full font-semibold flex items-center gap-1"
              style={{ background: '#fef9c3', color: '#854d0e' }}>
              🧺 {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── Exercise view ───────────────────────────────────────────────────────────────

function ExerciseView({ day, isCompleted, onToggle, onEditPrefs, isPastDay, onAILoaded }: {
  day: DayPlan; isCompleted: boolean; onToggle: () => void; onEditPrefs: () => void;
  isPastDay?: boolean; onAILoaded?: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Dumbbell className="w-5 h-5 text-dem-blue-500" />
            <h3 className="text-xl font-black text-gray-900">Today's Movement</h3>
            <button
              onClick={onEditPrefs}
              className="ml-1 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Edit exercise preferences"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
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
            <AIExerciseCoach
              exerciseId={ex.id}
              exerciseName={ex.name}
              description={ex.description}
              intensity={ex.intensity}
              energyLevel={day.energyLevel}
              locked={isPastDay}
              onLoaded={onAILoaded}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Mentality view ──────────────────────────────────────────────────────────────

function MentalityView({ day, isCompleted, onToggle, onEditPrefs }: {
  day: DayPlan; isCompleted: boolean; onToggle: () => void; onEditPrefs: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Brain className="w-5 h-5 text-dem-purple-500" />
            <h3 className="text-xl font-black text-gray-900">Mental Check-In</h3>
            <button
              onClick={onEditPrefs}
              className="ml-1 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Edit mentality preferences"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
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
          <Clock className="w-4 h-4" />
          <span>{day.mentality.check.duration}</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: '#fef9c3', border: '2px solid #fde047' }}>
        <p className="text-sm text-gray-700 text-center font-semibold leading-relaxed flex items-center justify-center gap-1.5">
          <Lightbulb className="w-4 h-4 flex-shrink-0 text-yellow-500" />
          Mentality is the glue. Without it, diet and exercise don't stick.
        </p>
      </div>
    </Card>
  );
}
