'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Sparkles, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { getCachedExerciseCoach, setCachedExerciseCoach, CachedExerciseCoach } from '@/lib/storage';

interface AIExerciseCoachProps {
  exerciseId: string;
  exerciseName: string;
  description: string;
  intensity: string;
  energyLevel: 'low' | 'medium' | 'high';
  locked?: boolean;
}

const ENERGY_ACCENT: Record<string, { color: string; shadow: string }> = {
  high:   { color: '#22c55e', shadow: '#15803d' },
  medium: { color: '#eab308', shadow: '#a16207' },
  low:    { color: '#3b82f6', shadow: '#1d4ed8' },
};

export default function AIExerciseCoach({
  exerciseId, exerciseName, description, intensity, energyLevel, locked,
}: AIExerciseCoachProps) {
  const [coaching, setCoaching] = useState<CachedExerciseCoach | null>(null);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError]       = useState('');

  const accent = ENERGY_ACCENT[energyLevel];

  useEffect(() => {
    const cached = getCachedExerciseCoach(exerciseId, energyLevel);
    if (cached) setCoaching(cached);
  }, [exerciseId, energyLevel]);

  const handleGenerate = async () => {
    if (locked) return;
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/ai-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName, description, intensity, energyLevel }),
      });
      const data = await res.json();
      if (data.success && data.coaching) {
        setCoaching(data.coaching);
        setCachedExerciseCoach(exerciseId, energyLevel, data.coaching);
        setExpanded(true);
      } else {
        setError('Could not load coaching tips. Try again.');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="rounded-2xl overflow-hidden mt-2"
      style={{
        background:  '#f8faff',
        border:      `2px solid ${accent.color}33`,
        boxShadow:   `0 3px 0 0 ${accent.color}22`,
      }}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* Trigger row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4" style={{ color: accent.color }} />
          <span className="text-sm font-bold" style={{ color: accent.color }}>
            AI Coach Tips
          </span>
        </div>

        {coaching ? (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            {expanded ? 'Hide' : 'Show'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : !locked ? (
          <motion.button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white disabled:opacity-60"
            style={{
              background:  accent.color,
              boxShadow:   loading ? 'none' : `0 3px 0 0 ${accent.shadow}`,
            }}
            whileTap={{ scale: 0.95, y: 2, boxShadow: 'none' }}
          >
            {loading ? (
              <motion.div
                className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
              />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {loading ? 'Loading...' : 'Get coaching tips'}
          </motion.button>
        ) : null}
      </div>

      {/* Error state */}
      {error && (
        <div className="px-4 pb-3 text-xs text-red-500">{error}</div>
      )}

      {/* Coaching content */}
      <AnimatePresence>
        {coaching && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Coaching cue */}
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: `${accent.color}12` }}
              >
                <p className="text-sm font-black" style={{ color: accent.shadow }}>
                  "{coaching.cue}"
                </p>
              </div>

              {/* Steps */}
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">How to do it</p>
                <ol className="space-y-1.5">
                  {coaching.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5"
                        style={{ background: accent.color }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Form tips */}
              {coaching.formTips?.length > 0 && (
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Form tips</p>
                  <ul className="space-y-1">
                    {coaching.formTips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600">
                        <span className="text-base leading-tight">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modification */}
              {coaching.modification && (
                <div className="rounded-xl px-3 py-2.5 bg-gray-50 border border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Modification</p>
                  <p className="text-sm text-gray-600">{coaching.modification}</p>
                </div>
              )}

              {/* YouTube search link */}
              {coaching.searchQuery && (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(coaching.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Watch on YouTube
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
