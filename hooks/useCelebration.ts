'use client';

import { useState, useCallback, useRef } from 'react';

export type CelebrationState =
  | { type: 'tasks_complete' }
  | { type: 'streak_milestone'; streakCount: number; nextMilestone: number };

export interface CelebrationOverlayProps {
  state: CelebrationState;
  onDismiss: () => void;
}

export function useCelebration(): {
  triggerCelebration: (state: CelebrationState) => void;
  celebrationProps: CelebrationOverlayProps | null;
  celebrationKey: number;
  dismissCelebration: () => void;
} {
  const [celebrationProps, setCelebrationProps] = useState<CelebrationOverlayProps | null>(null);
  // Incrementing key forces remount if triggered while overlay is open, restarting animation
  const counterRef = useRef(0);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const dismissCelebration = useCallback(() => {
    setCelebrationProps(null);
  }, []);

  const triggerCelebration = useCallback((state: CelebrationState) => {
    counterRef.current += 1;
    setCelebrationKey(counterRef.current);
    setCelebrationProps({ state, onDismiss: dismissCelebration });
  }, [dismissCelebration]);

  return { triggerCelebration, celebrationProps, celebrationKey, dismissCelebration };
}
