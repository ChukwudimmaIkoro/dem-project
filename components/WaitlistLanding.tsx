'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Mascot from './Mascot';

interface WaitlistLandingProps {
  onContinueToAlpha: () => void;
}

export default function WaitlistLanding({ onContinueToAlpha }: WaitlistLandingProps) {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}
    >
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          <Mascot message="Your health, your energy." mood="excited" persistent currentEnergy="high" size={100} />
          <h1 className="text-5xl font-black text-gray-900 mt-4">
            <span className="text-dem-green-500">Dem</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-semibold">Diet · Exercise · Mentality</p>
          <p className="text-gray-700 text-base font-bold mt-4 leading-snug max-w-xs mx-auto">
            The app that adapts. Today. Tomorrow. Every day.
          </p>
        </motion.div>

        {/* Pillars */}
        <motion.div
          className="flex gap-2 mt-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 26 }}
        >
          {[
            { emoji: '🥗', label: 'Diet' },
            { emoji: '🏋️', label: 'Exercise' },
            { emoji: '🧠', label: 'Mentality' },
          ].map(p => (
            <div
              key={p.label}
              className="flex items-center gap-1.5 bg-white rounded-2xl px-3 py-2 shadow-sm border border-gray-100 text-sm font-bold text-gray-700"
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div
          className="w-full mt-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 26 }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-6 text-center"
              >
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-lg font-black text-gray-900">You're on the list!</p>
                <p className="text-sm text-gray-500 mt-1">Check your inbox for a confirmation.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl shadow-xl p-6 space-y-3"
              >
                <p className="text-sm font-black text-gray-700 text-center">Get early access</p>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-800 outline-none transition-colors"
                  style={{ borderColor: email ? '#22c55e' : undefined }}
                />

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

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2"
                  style={{
                    background: '#22c55e',
                    boxShadow: '0 5px 0 0 #15803d',
                    opacity: loading ? 0.7 : 1,
                  }}
                  whileTap={loading ? {} : { scale: 0.97, y: 2, boxShadow: 'none' }}
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Working...</>
                    : 'Join the waitlist →'}
                </motion.button>

                <p className="text-[11px] text-gray-400 text-center">
                  No spam. Unsubscribe anytime.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Continue to alpha — bottom */}
      <motion.div
        className="mt-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={onContinueToAlpha}
          className="text-xs text-gray-400 hover:text-gray-600 font-semibold underline underline-offset-2 transition-colors"
        >
          Continue to alpha build →
        </button>
      </motion.div>
    </div>
  );
}
