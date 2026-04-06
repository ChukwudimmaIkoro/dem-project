'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { loadAppState, saveUserProfile, saveCurrentPlan } from '@/lib/storage';
import { migrateLocalDataToSupabase, loadUserProfile, loadActivePlan } from '@/lib/supabaseStorage';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  accentColor: string;
  accentDark: string;
}

type Mode = 'signin' | 'signup';

function validatePassword(pw: string): string | null {
  if (pw.length < 8)           return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))       return 'Must include an uppercase letter';
  if (!/[a-z]/.test(pw))       return 'Must include a lowercase letter';
  if (!/[0-9]/.test(pw))       return 'Must include a number';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Must include a special character (!@#$%^&* etc.)';
  return null;
}

export default function AuthModal({ onClose, onSuccess, accentColor, accentDark }: AuthModalProps) {
  const [mode,     setMode]     = useState<Mode>('signin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Password validation for sign-up only
    if (mode === 'signup') {
      const pwError = validatePassword(password);
      if (pwError) { setError(pwError); return; }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;

        // Migrate any existing local data up to Supabase
        const localState = loadAppState();
        if (localState.user && localState.currentPlan) {
          if (!localState.user.name && name) localState.user.name = name;
          await migrateLocalDataToSupabase(localState.user, localState.currentPlan);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        // Pull cloud data down into localStorage so the app immediately reflects the user's saved state.
        // This is the key fix for "progress not restored after sign-in".
        const [cloudUser, cloudPlan] = await Promise.all([loadUserProfile(), loadActivePlan()]);
        if (cloudUser) saveUserProfile(cloudUser);
        if (cloudPlan) saveCurrentPlan(cloudPlan);

        // Also push any local-only data that wasn't already synced (e.g. new session on same device)
        if (!cloudPlan) {
          const localState = loadAppState();
          if (localState.user && localState.currentPlan) {
            await migrateLocalDataToSupabase(localState.user, localState.currentPlan);
          }
        }
      }

      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
        style={{ maxHeight: '90vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === 'signup' ? 'Sync your progress across devices' : 'Welcome back!'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-5 flex-1 overflow-y-auto">
          {/* Mode toggle */}
          <div className="flex rounded-2xl bg-gray-100 p-1 mb-5">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-xl text-sm font-black transition-all"
                style={{
                  background: mode === m ? 'white' : 'transparent',
                  color:      mode === m ? '#111827' : '#9ca3af',
                  boxShadow:  mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name — signup only */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-black text-gray-600 mb-1.5">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your first name"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-800 outline-none transition-colors"
                      style={{ borderColor: name ? accentColor : undefined }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-800 outline-none transition-colors"
                  style={{ borderColor: email ? accentColor : undefined }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Create a strong password' : '••••••••'}
                  required
                  className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-800 outline-none transition-colors"
                  style={{ borderColor: password ? accentColor : undefined }}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
                  8+ chars, uppercase, lowercase, number, special character
                </p>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-semibold text-red-500 bg-red-50 rounded-xl px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-base font-black text-white mt-1 flex items-center justify-center gap-2"
              style={{
                background: accentColor,
                boxShadow:  `0 5px 0 0 ${accentDark}`,
                opacity:    loading ? 0.7 : 1,
              }}
              whileTap={loading ? {} : { scale: 0.97, y: 2, boxShadow: 'none' }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Working...</>
                : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </motion.button>
          </form>

          {mode === 'signup' && (
            <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
              Your existing progress will be saved to your account.
              No data is shared with third parties.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
