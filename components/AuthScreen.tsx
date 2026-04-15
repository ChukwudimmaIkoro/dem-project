'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import Mascot from './Mascot';

interface AuthScreenProps {
  onAuth: (user: SupabaseUser) => void;
}

type Mode = 'signin' | 'signup';

function validatePassword(pw: string): string | null {
  if (pw.length < 8)            return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw))        return 'Must include an uppercase letter';
  if (!/[a-z]/.test(pw))        return 'Must include a lowercase letter';
  if (!/[0-9]/.test(pw))        return 'Must include a number';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Must include a special character (!@#$%^&* etc.)';
  return null;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode,        setMode]        = useState<Mode>('signup');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      const pwError = validatePassword(password);
      if (pwError) { setError(pwError); return; }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() || 'Friend' } },
        });
        if (signUpError) throw signUpError;
        // If session is null, email confirmation is required — show pending state.
        // onAuthStateChange fires automatically when user confirms.
        if (!data.session) { setPendingEmail(email); return; }
        if (data.user) onAuth(data.user);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) onAuth(data.user);
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Something went wrong';
      // Map Supabase's "User already registered" to a friendlier message
      if (
        mode === 'signup' &&
        (raw.toLowerCase().includes('already registered') ||
         raw.toLowerCase().includes('already been registered') ||
         raw.toLowerCase().includes('user already exists') ||
         raw.toLowerCase().includes('email address is already'))
      ) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email confirmation pending ───────────────────────────────────────────────
  if (pendingEmail) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
        style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          <Mascot
            message="Check your inbox!"
            mood="excited"
            persistent
            currentEnergy="high"
            size={90}
          />
          <h2 className="text-2xl font-black text-gray-900 mt-4">Confirm your email</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            We sent a confirmation link to<br />
            <span className="font-bold text-gray-700">{pendingEmail}</span>
          </p>
          <p className="text-sm text-gray-400 mt-4 leading-relaxed">
            Click the link in that email to activate your account and jump into Dem.
          </p>
          <button
            onClick={() => { setPendingEmail(null); setMode('signin'); setPassword(''); }}
            className="mt-6 text-xs text-dem-green-600 font-bold underline underline-offset-2"
          >
            Already confirmed? Sign in
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}
    >
      {/* Branding */}
      <motion.div
        className="text-center mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <Mascot
          message={mode === 'signup' ? "Hi! I'm your health companion! 👋" : 'Welcome back!'}
          mood="excited"
          persistent
          currentEnergy="high"
          size={90}
        />
        <h1 className="text-4xl font-black text-gray-900 mt-3">
          <span className="text-dem-green-500">Dem</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Diet · Exercise · Mentality</p>
      </motion.div>

      {/* Card */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.1 }}
      >
        {/* Mode toggle */}
        <div className="flex rounded-2xl bg-gray-100 p-1 mb-5">
          {(['signup', 'signin'] as Mode[]).map(m => (
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
              {m === 'signup' ? 'Create Account' : 'Sign In'}
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
                <label className="block text-xs font-black text-gray-600 mb-1.5">Your name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="What should we call you?"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-800 outline-none transition-colors"
                    style={{ borderColor: name ? '#22c55e' : undefined }}
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
                style={{ borderColor: email ? '#22c55e' : undefined }}
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
                style={{ borderColor: password ? '#22c55e' : undefined }}
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
            className="w-full py-3.5 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2"
            style={{
              background: '#22c55e',
              boxShadow:  '0 5px 0 0 #15803d',
              opacity:    loading ? 0.7 : 1,
            }}
            whileTap={loading ? {} : { scale: 0.97, y: 2, boxShadow: 'none' }}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Working...</>
              : mode === 'signup' ? "Let's go! →" : 'Sign In'}
          </motion.button>
        </form>

        {mode === 'signup' && (
          <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
            No data is shared with third parties. Your progress syncs across devices.
          </p>
        )}
      </motion.div>
    </div>
  );
}
