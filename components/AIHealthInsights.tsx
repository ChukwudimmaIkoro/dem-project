'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader, Sparkles } from 'lucide-react';
import { getCachedInsight, setCachedInsight, CachedInsight } from '@/lib/storage';

interface InsightsProps {
  energyHistory: ('low' | 'medium' | 'high')[];
  completionHistory: { diet: boolean; exercise: boolean; mentality: boolean }[];
  userName?: string;
  streak: number;
  currentDayNumber: number;
}

export default function AIHealthInsights({
  energyHistory,
  completionHistory,
  userName,
  streak,
  currentDayNumber,
}: InsightsProps) {
  const [insight, setInsight] = useState<CachedInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCareNote, setShowCareNote] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  // Load cache on mount — no auto-fetch
  useEffect(() => {
    const cached = getCachedInsight(currentDayNumber);
    if (cached) setInsight(cached);
  }, [currentDayNumber]);

  // Check if current day is fully complete
  const currentDayCompletion = completionHistory[currentDayNumber - 1];
  const dayIsComplete = currentDayCompletion
    && currentDayCompletion.diet
    && currentDayCompletion.exercise
    && currentDayCompletion.mentality;

  const doFetch = async () => {
    setLoading(true);
    setError('');
    setShowIncompleteWarning(false);

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energyHistory, completionHistory, userName, streak }),
      });
      const data = await res.json();
      const result: CachedInsight = {
        ...data.insight,
        alerts: data.alerts ?? [],
      };
      setInsight(result);
      setCachedInsight(currentDayNumber, result); // persist
    } catch {
      setError('Could not load insights. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleButton = () => {
    // Already have a cached result — just show it (button becomes "Refresh")
    if (insight) { doFetch(); return; }

    // Day not complete — warn first
    if (!dayIsComplete) {
      setShowIncompleteWarning(true);
    } else {
      doFetch();
    }
  };

  const TrendIcon = insight?.trend === 'improving' ? TrendingUp
    : insight?.trend === 'declining' ? TrendingDown
    : Minus;

  const trendColor = insight?.trend === 'improving' ? 'text-dem-green-600'
    : insight?.trend === 'declining' ? 'text-red-500'
    : 'text-dem-yellow-600';

  return (
    <div className="mt-4">
      {/* Incomplete day warning */}
      {showIncompleteWarning && (
        <div className="bg-dem-yellow-50 border-2 border-dem-yellow-300 rounded-2xl p-4 mb-3">
          <p className="text-sm font-semibold text-dem-yellow-800 mb-3">
            You haven't completed enough tasks today for a fully accurate report. Continue anyway?
          </p>
          <div className="flex gap-2">
            <button
              onClick={doFetch}
              className="flex-1 bg-dem-yellow-400 text-white py-2 rounded-xl text-sm font-bold active:scale-95 transition-all"
            >
              Yes, show me
            </button>
            <button
              onClick={() => setShowIncompleteWarning(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all"
            >
              Not yet
            </button>
          </div>
        </div>
      )}

      {/* Main insight panel */}
      <div className="bg-gradient-to-br from-dem-blue-50 to-dem-purple-50 rounded-2xl p-4 border border-dem-blue-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-dem-blue-600" />
            <h3 className="font-bold text-gray-800">Health Insight Summary</h3>
          </div>
          <button
            onClick={handleButton}
            disabled={loading}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
              transition-all active:scale-95
              ${loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-dem-blue-500 text-white hover:bg-dem-blue-600'
              }
            `}
          >
            {loading ? (
              <><Loader className="w-3 h-3 animate-spin" /> Analyzing...</>
            ) : insight ? (
              <><Sparkles className="w-3 h-3" /> Refresh</>
            ) : (
              <><Sparkles className="w-3 h-3" /> Health Insight Summary</>
            )}
          </button>
        </div>

        {!insight && !loading && (
          <p className="text-sm text-gray-500 text-center py-4">
            Tap the button above to get your AI health summary.
          </p>
        )}

        {loading && (
          <div className="text-center py-4">
            <Loader className="w-6 h-6 animate-spin text-dem-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Analyzing your progress...</p>
          </div>
        )}

        {insight && !loading && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <TrendIcon className={`w-5 h-5 ${trendColor}`} />
              <span className={`text-sm font-bold capitalize ${trendColor}`}>
                {insight.trend === 'insufficient_data' ? 'Building baseline...' : insight.trend}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-3 leading-relaxed">{insight.insight}</p>

            <div className="bg-white rounded-xl p-3 mb-3">
              <p className="text-sm text-dem-green-700 font-medium">
                {insight.patientMessage}
              </p>
            </div>

            <button
              onClick={() => setShowCareNote(!showCareNote)}
              className="text-xs text-dem-blue-600 underline"
            >
              {showCareNote ? 'Hide' : 'View'} care team note
            </button>

            {showCareNote && (
              <div className="mt-2 bg-dem-blue-100 rounded-xl p-3 border border-dem-blue-200">
                <p className="text-xs text-dem-blue-800">
                  <span className="font-bold">Clinical Note:</span> {insight.careNote}
                </p>
              </div>
            )}

            {/* Alerts */}
            {insight.alerts?.length > 0 && (
              <div className="mt-3 space-y-2">
                {insight.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 border-2 ${
                      alert.severity === 'HIGH'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-dem-yellow-50 border-dem-yellow-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                        alert.severity === 'HIGH' ? 'text-red-500' : 'text-dem-yellow-600'
                      }`} />
                      <div>
                        <p className="text-xs font-bold text-gray-800">{alert.message}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{alert.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
}