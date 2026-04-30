'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getCachedMentalityGuide, setCachedMentalityGuide, CachedMentalityGuide } from '@/lib/storage';
import { hasTreatsLeft, useTreat, getTreatsRemainingToday } from '@/lib/thinkyTreats';

interface AIMentalityGuideProps {
  checkId: string;
  title: string;
  protocol: string;
  energyLevel: 'low' | 'medium' | 'high';
  dayNumber: number;
  locked?: boolean;
}

const ENERGY_ACCENT: Record<string, { color: string; shadow: string }> = {
  high:   { color: '#22c55e', shadow: '#15803d' },
  medium: { color: '#eab308', shadow: '#a16207' },
  low:    { color: '#3b82f6', shadow: '#1d4ed8' },
};

export default function AIMentalityGuide({ checkId, title, protocol, energyLevel, dayNumber, locked }: AIMentalityGuideProps) {
  const [guide,      setGuide]      = useState<CachedMentalityGuide | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [expanded,   setExpanded]   = useState(false);
  const [error,      setError]      = useState('');
  const [treatsLeft, setTreatsLeft] = useState(getTreatsRemainingToday);

  const accent = ENERGY_ACCENT[energyLevel];

  useEffect(() => {
    const cached = getCachedMentalityGuide(checkId, energyLevel);
    if (cached) setGuide(cached);
  }, [checkId, energyLevel]);

  useEffect(() => {
    const refresh = () => setTreatsLeft(getTreatsRemainingToday());
    window.addEventListener('treats-updated', refresh);
    return () => window.removeEventListener('treats-updated', refresh);
  }, []);

  const handleGenerate = async () => {
    if (locked) return;
    if (!hasTreatsLeft()) return;
    useTreat();
    setTreatsLeft(getTreatsRemainingToday());
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/ai-mentality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, protocol, energyLevel }),
      });
      const data = await res.json();
      if (data.success && data.guide) {
        setGuide(data.guide);
        setCachedMentalityGuide(checkId, energyLevel, data.guide);
        setExpanded(true);
      } else {
        setError('Could not load guide. Try again.');
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
      style={{ background: '#faf5ff', border: `2px solid ${accent.color}33`, boxShadow: `0 3px 0 0 ${accent.color}22` }}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: accent.color }} />
          <span className="text-sm font-bold" style={{ color: accent.color }}>AI Clinical Guide</span>
        </div>

        {guide ? (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
          >
            {expanded ? 'Hide' : 'Show'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : !locked ? (
          loading || treatsLeft > 0 ? (
            <motion.button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white disabled:opacity-60"
              style={{ background: accent.color, boxShadow: loading ? 'none' : `0 3px 0 0 ${accent.shadow}` }}
              whileTap={{ scale: 0.95, y: 2, boxShadow: 'none' }}
            >
              {loading ? (
                <motion.div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {loading ? 'Loading...' : `🍬 Guide me · ${treatsLeft} treat${treatsLeft !== 1 ? 's' : ''} left`}
            </motion.button>
          ) : (
            <span className="text-xs font-black px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              🍬 Out of Treats! Resets tomorrow.
            </span>
          )
        ) : null}
      </div>

      {error && <div className="px-4 pb-3 text-xs text-red-500">{error}</div>}

      <AnimatePresence>
        {guide && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1.5px solid ${accent.color}22` }}>
              {/* Rationale */}
              <div className="rounded-xl p-3 mt-2" style={{ background: `${accent.color}10`, border: `1px solid ${accent.color}33` }}>
                <p className="text-xs font-semibold text-gray-700 leading-relaxed">{guide.rationale}</p>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {guide.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                    className="flex gap-2.5 text-xs"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center font-black flex-shrink-0 text-white text-[10px]"
                      style={{ background: accent.color }}
                    >
                      {i + 1}
                    </div>
                    <p className="leading-relaxed text-gray-700 pt-0.5">{step}</p>
                  </motion.div>
                ))}
              </div>

              {/* Notice prompt */}
              <div className="rounded-xl p-3" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
                <p className="text-xs font-semibold text-amber-800">{guide.noticePrompt}</p>
              </div>

              {/* When to use */}
              <p className="text-[11px] text-gray-400 leading-relaxed">{guide.whenToUse}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
