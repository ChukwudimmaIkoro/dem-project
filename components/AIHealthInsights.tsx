'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles, ChevronDown, Stethoscope, ShieldCheck } from 'lucide-react';
import { getCachedInsight, setCachedInsight, CachedInsight } from '@/lib/storage';

interface InsightsProps {
  energyHistory: ('low' | 'medium' | 'high')[];
  completionHistory: { diet: boolean; exercise: boolean; mentality: boolean }[];
  userName?: string;
  streak: number;
  currentDayNumber: number;
}

const TREND_CONFIG = {
  improving:          { Icon: TrendingUp,   color: '#22c55e', label: 'Improving'         },
  stable:             { Icon: Minus,        color: '#eab308', label: 'Stable'             },
  declining:          { Icon: TrendingDown, color: '#ef4444', label: 'Declining'          },
  insufficient_data:  { Icon: Activity,     color: '#6b7280', label: 'Building baseline…' },
} as const;

export default function AIHealthInsights({
  energyHistory,
  completionHistory,
  userName,
  streak,
  currentDayNumber,
}: InsightsProps) {
  const [insight, setInsight]                     = useState<CachedInsight | null>(null);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');
  const [showCareNote, setShowCareNote]           = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  useEffect(() => {
    const cached = getCachedInsight(currentDayNumber);
    if (cached) setInsight(cached);
  }, [currentDayNumber]);

  const currentDayCompletion = completionHistory[currentDayNumber - 1];
  const dayIsComplete = !!(
    currentDayCompletion?.diet &&
    currentDayCompletion?.exercise &&
    currentDayCompletion?.mentality
  );

  const doFetch = async () => {
    setLoading(true);
    setError('');
    setShowIncompleteWarning(false);
    try {
      const res  = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energyHistory, completionHistory, userName, streak }),
      });
      const data = await res.json();
      const result: CachedInsight = { ...data.insight, alerts: data.alerts ?? [] };
      setInsight(result);
      setCachedInsight(currentDayNumber, result);
    } catch {
      setError('Could not load insights. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleButton = () => {
    if (insight) { doFetch(); return; }
    if (!dayIsComplete) { setShowIncompleteWarning(true); } else { doFetch(); }
  };

  const trendKey = (insight?.trend ?? 'insufficient_data') as keyof typeof TREND_CONFIG;
  const trend    = TREND_CONFIG[trendKey] ?? TREND_CONFIG.insufficient_data;

  return (
    <div className="mt-4">
      {/* Incomplete day warning */}
      <AnimatePresence>
        {showIncompleteWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="overflow-hidden mb-3"
          >
            <div
              className="rounded-2xl p-4"
              style={{ background: '#fefce8', border: '2px solid #fcd34d' }}
            >
              <p className="text-sm font-semibold text-amber-800 mb-3">
                You haven't completed all tasks today — the summary may be partial. Continue anyway?
              </p>
              <div className="flex gap-2">
                <motion.button
                  onClick={doFetch}
                  className="flex-1 py-2 rounded-xl text-sm font-black text-white"
                  style={{ background: '#eab308', boxShadow: '0 4px 0 0 #a16207' }}
                  whileTap={{ scale: 0.96, y: 2, boxShadow: 'none' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  Yes, show me
                </motion.button>
                <motion.button
                  onClick={() => setShowIncompleteWarning(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-black text-gray-700"
                  style={{ background: '#f3f4f6', boxShadow: '0 4px 0 0 #d1d5db' }}
                  whileTap={{ scale: 0.96, y: 2, boxShadow: 'none' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  Not yet
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main panel */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#ffffff',
          border:     '1.5px solid #e2e8f0',
          boxShadow:  '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100">
                <Activity className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h3 className="font-black text-sm text-gray-900">Health Summary</h3>
                <p className="text-[11px] text-gray-400">For your care provider — generated from your self-reported data</p>
              </div>
            </div>

          <motion.button
            onClick={handleButton}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white"
            style={{
              background:  loading ? '#d1d5db' : '#3b82f6',
              boxShadow:   loading ? 'none'    : '0 4px 0 0 #1d4ed8',
              cursor:      loading ? 'not-allowed' : 'pointer',
            }}
            whileTap={loading ? {} : { scale: 0.95, y: 2, boxShadow: 'none' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  key="loading"
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-3 h-3 rounded-full border-2 border-white border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                  />
                  Analyzing…
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Sparkles className="w-3 h-3" />
                  {insight ? 'Refresh' : 'Analyze'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {/* Empty state */}
          <AnimatePresence>
            {!insight && !loading && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-400 text-center py-5"
              >
                Tap Analyze to get your AI health summary.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-col items-center py-6 gap-2"
              >
                <motion.div
                  className="w-8 h-8 rounded-full border-3 border-blue-200 border-t-blue-500"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                  style={{ borderWidth: 3 }}
                />
                <p className="text-xs text-gray-400">Analyzing your progress…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insight content */}
          <AnimatePresence>
            {insight && !loading && (
              <motion.div
                key="insight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              >
                {/* Trend pill */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                  style={{ background: `${trend.color}18`, border: `1.5px solid ${trend.color}44` }}
                >
                  <trend.Icon className="w-3.5 h-3.5" style={{ color: trend.color }} />
                  <span className="text-xs font-black" style={{ color: trend.color }}>{trend.label}</span>
                </motion.div>

                {/* Insight text */}
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{insight.insight}</p>

                {/* Patient message */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 24 }}
                  className="rounded-xl p-3 mb-3"
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid #bfdbfe' }}
                >
                  <p className="text-sm text-green-700 font-semibold leading-relaxed">{insight.patientMessage}</p>
                </motion.div>

                {/* Clinical note toggle */}
                <motion.button
                  onClick={() => setShowCareNote(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <motion.div
                    animate={{ rotate: showCareNote ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                  {showCareNote ? 'Hide' : 'View'} clinical note
                </motion.button>

                <AnimatePresence>
                  {showCareNote && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="rounded-xl p-3" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-black text-slate-700">Clinical Note: </span>
                          {insight.careNote}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                          If your doctor or care coordinator recommended a plan like this, share this summary at your next visit.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Clinical alerts */}
                {insight.alerts?.length > 0 && (
                  <div className="space-y-2 mt-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Clinical Flags</p>
                    {insight.alerts.map((alert, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                        className="rounded-xl p-3"
                        style={{
                          background: alert.severity === 'HIGH' ? '#fff5f5' : '#fffbeb',
                          border:     `1px solid ${alert.severity === 'HIGH' ? '#fecaca' : '#fde68a'}`,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle
                            className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                            style={{ color: alert.severity === 'HIGH' ? '#dc2626' : '#d97706' }}
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-700">{alert.message}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{alert.recommendation}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* HIPAA-framed disclaimer */}
                <div className="flex items-start gap-2 mt-4 pt-3 border-t border-gray-100">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    No personally identifiable data is sent to third parties without your consent. This summary is stored on your device only.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 text-center mt-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
