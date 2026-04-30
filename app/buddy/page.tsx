'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function BuddyContent() {
  const params  = useSearchParams();
  const habit   = params.get('habit') ?? '';
  const name    = params.get('name') ?? 'Someone';
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);

  // If they come from a buddy link, pre-fill their own habit in localStorage
  useEffect(() => {
    if (habit) {
      try {
        const raw = localStorage.getItem('dem-app-state');
        if (raw) {
          const state = JSON.parse(raw);
          if (state.user && !state.user.demPlusHabit) {
            state.user.demPlusHabit = habit;
            localStorage.setItem('dem-app-state', JSON.stringify(state));
          }
        }
      } catch {}
    }
  }, [habit]);

  const handleJoin = () => {
    setJoined(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const accent = '#22c55e';
  const accentDark = '#16a34a';

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
        <div className="text-center space-y-3">
          <p className="text-4xl">🤔</p>
          <p className="font-black text-gray-700">No habit found in this link.</p>
          <Link href="/" className="text-sm font-bold hover:underline" style={{ color: accent }}>← Go to Dem</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 100%)' }}>
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-black" style={{ color: accent }}>Dem</Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-6 space-y-5 text-center"
        >
          <div className="space-y-1">
            <p className="text-4xl">🤝</p>
            <h1 className="text-xl font-black text-gray-900">Accountabuddies</h1>
            <p className="text-sm text-gray-400">
              <span className="font-bold text-gray-700">{name}</span> is building a habit and wants you on their team.
            </p>
          </div>

          {/* Habit callout */}
          <div className="rounded-2xl px-4 py-4" style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
            <p className="text-xs font-black uppercase tracking-wide text-green-600 mb-1">The Habit</p>
            <p className="text-base font-black text-gray-900">{decodeURIComponent(habit)}</p>
          </div>

          {joined ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-3"
            >
              <p className="text-2xl">🎉</p>
              <p className="font-black text-gray-900">You&apos;re in!</p>
              <p className="text-sm text-gray-500">
                This habit has been added to your Dem account. Keep each other accountable!
              </p>
              <Link
                href="/"
                className="block w-full py-3 rounded-2xl text-sm font-black text-white text-center"
                style={{ background: accent, boxShadow: `0 4px 0 0 ${accentDark}` }}
              >
                Open Dem →
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <motion.button
                onClick={handleJoin}
                className="w-full py-3.5 rounded-2xl text-base font-black text-white"
                style={{ background: accent, boxShadow: `0 5px 0 0 ${accentDark}` }}
                whileTap={{ scale: 0.97, y: 2, boxShadow: 'none' }}
              >
                Be Their Buddy 🤝
              </motion.button>
              <p className="text-xs text-gray-400">
                Adds this habit to your Dem account so you can both track it together.
              </p>
            </div>
          )}
        </motion.div>

        {/* Share section */}
        <div className="bg-white rounded-2xl p-4 space-y-2">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Share this link</p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl px-3 py-2 bg-gray-50 border border-gray-200 text-xs text-gray-400 font-mono truncate">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </div>
            <motion.button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl text-xs font-black text-white flex-shrink-0"
              style={{ background: copied ? '#16a34a' : accent }}
              whileTap={{ scale: 0.92 }}
            >
              {copied ? '✓' : 'Copy'}
            </motion.button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Don&apos;t have Dem yet?{' '}
          <Link href="/" className="font-bold hover:underline" style={{ color: accent }}>Try it free</Link>
        </p>

      </div>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <Suspense>
      <BuddyContent />
    </Suspense>
  );
}
