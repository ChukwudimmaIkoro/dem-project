// Required install:
// npm install canvas-confetti
// npm install --save-dev @types/canvas-confetti

'use client';

import { useEffect, useRef, useState } from 'react';
import { Trophy, Flame, Star, CheckCircle2, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CelebrationOverlayProps, CelebrationState } from '@/hooks/useCelebration';
import Mascot from './Mascot';
import styles from '@/styles/celebration.module.css';

// ─── All tunable values in one place ─────────────────────────────────────────

const CELEBRATION_CONFIG = {
  tasks_complete: {
    particleCount: 40,
    accentColor:   '#FFD700',
    colors: ['#FFD700', '#22c55e', '#3b82f6', '#a855f7', '#f97316'],
  },
  streak_milestone: {
    particleCount: 80,
    accentColor:   '#FF6B35',
    colors: ['#FF6B35', '#eab308', '#22c55e', '#3b82f6', '#FFD700'],
  },
  timing: {
    backdropFadeMs:        300,
    dismissFadeMs:         250,
    continueButtonDelayMs: 1200,
    confettiDelayMs:       100,
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function CelebrationOverlay({ state, onDismiss }: CelebrationOverlayProps): JSX.Element {
  const [isExiting, setIsExiting] = useState(false);
  const continueBtnRef = useRef<HTMLButtonElement>(null);

  const isMilestone   = state.type === 'streak_milestone';
  const config        = CELEBRATION_CONFIG[state.type];
  const milestoneState = isMilestone
    ? (state as Extract<CelebrationState, { type: 'streak_milestone' }>)
    : null;

  const headline   = isMilestone ? `${milestoneState!.streakCount}-Day Streak!` : 'All done for today!';
  const subtext    = isMilestone ? "You're on fire. Don't stop now." : 'You crushed your list. See you tomorrow.';
  const progressPct = isMilestone
    ? Math.min(100, Math.round((milestoneState!.streakCount / milestoneState!.nextMilestone) * 100))
    : 0;

  const supportIconClasses = [styles.supportIcon0, styles.supportIcon1, styles.supportIcon2];
  const supportIcons = isMilestone ? [Flame, Flame, Trophy] : [Star, CheckCircle2, Zap];

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const confettiTimer = setTimeout(() => {
      if (!reducedMotion) {
        confetti({
          particleCount: config.particleCount,
          spread:        70,
          origin:        { x: 0.5, y: 0.5 },
          colors:        [...config.colors],
          startVelocity: 28,
          gravity:       0.9,
          scalar:        1.1,
        });
      }
    }, CELEBRATION_CONFIG.timing.confettiDelayMs);

    const focusTimer = setTimeout(() => {
      continueBtnRef.current?.focus();
    }, CELEBRATION_CONFIG.timing.continueButtonDelayMs);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(focusTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    setIsExiting(true);
    setTimeout(onDismiss, CELEBRATION_CONFIG.timing.dismissFadeMs);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={headline}
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 gap-0 ${isExiting ? styles.overlayExit : styles.backdrop}`}
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
    >
      <div className={styles.iconPop}>
        <Mascot
          message={subtext}
          mood={isMilestone ? 'excited' : 'happy'}
          currentEnergy={isMilestone ? 'high' : 'medium'}
          persistent
          size={110}
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl px-7 py-6 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 mt-2">

        {/* Central icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${styles.iconPop}`}
          style={{ background: `${config.accentColor}1a` }}
        >
          {isMilestone ? (
            <Flame className={`w-9 h-9 ${styles.flamePulse}`} style={{ color: config.accentColor }} />
          ) : (
            <Trophy className="w-9 h-9" style={{ color: config.accentColor }} />
          )}
        </div>

        {/* Headline */}
        <div role="status" aria-live="polite">
          <h2 className={`text-2xl font-black text-gray-900 text-center ${styles.slideUp}`}>
            {headline}
          </h2>
        </div>

        {/* Supporting icons */}
        <div className="flex gap-3">
          {supportIcons.map((Icon, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${supportIconClasses[i]}`}
              style={{ background: `${config.accentColor}18` }}
            >
              <Icon className="w-5 h-5" style={{ color: config.accentColor }} />
            </div>
          ))}
        </div>

        {/* Streak progress bar — State B only */}
        {isMilestone && (
          <div className={`w-full ${styles.subtext}`}>
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
              <span>{milestoneState!.streakCount} days</span>
              <span>Next: {milestoneState!.nextMilestone} days</span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${styles.streakBar}`}
                style={{
                  background:  `linear-gradient(90deg, ${config.accentColor}, ${config.accentColor}bb)`,
                  boxShadow:   `2px 0 12px ${config.accentColor}88`,
                  '--streak-progress': `${progressPct}%`,
                } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* Continue button */}
        <button
          ref={continueBtnRef}
          onClick={handleContinue}
          className={`w-full py-3.5 rounded-2xl text-base font-black text-white ${styles.continueBtn}`}
          style={{
            background: config.accentColor,
            boxShadow:  `0 5px 0 0 ${config.accentColor}99`,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
