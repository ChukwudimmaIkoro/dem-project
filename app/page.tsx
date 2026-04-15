'use client';

import { useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { loadAppState, saveUserProfile, saveCurrentPlan, clearAppState } from '@/lib/storage';
import { loadUserProfile, loadActivePlan } from '@/lib/supabaseStorage';
import { restoreTutorialsSeen } from '@/hooks/useTutorial';
import AuthScreen from '@/components/AuthScreen';
import OnboardingFlow from '@/components/OnboardingFlow';
import PlanView from '@/components/PlanView';

type Screen = 'loading' | 'auth' | 'onboarding' | 'app';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
      <div className="text-center">
        <div className="text-6xl mb-4">💪</div>
        <h1 className="text-3xl font-black text-dem-green-600">Dem V2</h1>
        <p className="text-gray-500 mt-2 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [screen,   setScreen]   = useState<Screen>('loading');
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Pull cloud data into localStorage, then decide which screen to show.
  // Called on every successful auth (sign-in, sign-up, session restore).
  const bootstrap = useCallback(async (user: User) => {
    setAuthUser(user);

    // Restore cloud data → localStorage. Use allSettled so a Supabase hiccup on one
    // call doesn't block the others or leave the user stuck on the loading screen.
    const [userResult, planResult] = await Promise.allSettled([
      loadUserProfile(),
      loadActivePlan(),
      restoreTutorialsSeen(),
    ]);
    const cloudUser = userResult.status === 'fulfilled' ? userResult.value : null;
    const cloudPlan = planResult.status === 'fulfilled' ? planResult.value : null;
    if (cloudUser) {
      // Preserve longestStreak from localStorage — take the higher of cloud vs local.
      const localState = loadAppState();
      saveUserProfile({
        ...cloudUser,
        longestStreak: Math.max(cloudUser.longestStreak ?? 0, localState.user?.longestStreak ?? 0),
      });
    }
    if (cloudPlan) saveCurrentPlan(cloudPlan);

    // Cloud plan is authoritative — don't let stale localStorage skip onboarding for new users
    setScreen(cloudPlan ? 'app' : 'onboarding');
  }, []);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        bootstrap(data.user);
      } else {
        setScreen('auth');
      }
    });

    // Only handle explicit sign-in / sign-out events — not INITIAL_SESSION
    // (getUser() above already handles the session-restore case)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        bootstrap(session.user);
      } else if (event === 'SIGNED_OUT') {
        clearAppState();
        setAuthUser(null);
        setScreen('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [bootstrap]);

  if (screen === 'loading') return <LoadingScreen />;

  if (screen === 'auth') {
    return <AuthScreen onAuth={user => bootstrap(user)} />;
  }

  if (screen === 'onboarding') {
    const userName = authUser?.user_metadata?.name || '';
    return (
      <OnboardingFlow
        userName={userName}
        onComplete={() => setScreen('app')}
      />
    );
  }

  return (
    <PlanView
      onReset={() => setScreen('onboarding')}
      onSignOut={async () => {
        await supabase.auth.signOut();
        // onAuthStateChange fires and handles clearAppState + screen reset
      }}
      authUserEmail={authUser?.email ?? ''}
      authUserName={authUser?.user_metadata?.name ?? ''}
    />
  );
}
