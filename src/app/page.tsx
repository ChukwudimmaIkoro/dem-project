'use client';

import { useEffect, useState } from 'react';
import { AppState } from '@/types';
import { loadAppState } from '@/lib/storage';
import OnboardingFlow from '@/components/OnboardingFlow';
import PlanView from '@/components/PlanView';

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load state from localStorage
    const state = loadAppState();
    setAppState(state);
    setIsLoading(false);
  }, []);

  // Show loading state
  if (isLoading || !appState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-bold text-dem-green-600">Dem</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate view
  if (!appState.hasCompletedOnboarding || !appState.user) {
    return <OnboardingFlow onComplete={() => setAppState(loadAppState())} />;
  }

  if (!appState.currentPlan) {
    return <OnboardingFlow onComplete={() => setAppState(loadAppState())} />;
  }

  return <PlanView onReset={() => setAppState(loadAppState())} />;
}