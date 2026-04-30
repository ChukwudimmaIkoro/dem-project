'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, Zap, ChevronDown, Sparkles, Sunrise, Sun, Moon, Coffee, Lightbulb, type LucideIcon } from 'lucide-react';
import { getCachedRecipe, setCachedRecipe, CachedRecipe, incrementUserStat } from '@/lib/storage';
import { hasTreatsLeft, useTreat, getTreatsRemainingToday } from '@/lib/thinkyTreats';

interface AIRecipeCardProps {
  foods: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  energyLevel: 'low' | 'medium' | 'high';
  dayNumber: number;
  userName?: string;
  locked?: boolean;
  onLoaded?: () => void;
}

const MEAL_META: Record<string, { label: string; Icon: LucideIcon; bg: string; border: string; textColor: string }> = {
  breakfast: { label: 'Breakfast', Icon: Sunrise, bg: '#fffbeb', border: '#fcd34d', textColor: '#92400e' },
  lunch:     { label: 'Lunch',     Icon: Sun,     bg: '#eff6ff', border: '#93c5fd', textColor: '#1e40af' },
  dinner:    { label: 'Dinner',    Icon: Moon,    bg: '#faf5ff', border: '#c4b5fd', textColor: '#6b21a8' },
  snack:     { label: 'Snack',     Icon: Coffee,  bg: '#f0fdf4', border: '#86efac', textColor: '#166534' },
};

const ENERGY_ACCENT: Record<string, { color: string; shadow: string }> = {
  high:   { color: '#22c55e', shadow: '#15803d' },
  medium: { color: '#eab308', shadow: '#a16207' },
  low:    { color: '#3b82f6', shadow: '#1d4ed8' },
};

export default function AIRecipeCard({ foods, mealType, energyLevel, dayNumber, userName, locked, onLoaded }: AIRecipeCardProps) {
  const [recipe, setRecipe]   = useState<CachedRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError]     = useState('');
  const [treatsLeft, setTreatsLeft] = useState(getTreatsRemainingToday);

  const meta   = MEAL_META[mealType];
  const accent = ENERGY_ACCENT[energyLevel];

  useEffect(() => {
    const cached = getCachedRecipe(dayNumber, mealType);
    if (cached) setRecipe(cached);
  }, [dayNumber, mealType]);

  useEffect(() => {
    const refresh = () => setTreatsLeft(getTreatsRemainingToday());
    window.addEventListener('treats-updated', refresh);
    return () => window.removeEventListener('treats-updated', refresh);
  }, []);

  const handleGenerate = async () => {
    if (locked || foods.length === 0) return;
    if (!hasTreatsLeft()) return;
    useTreat();
    setTreatsLeft(getTreatsRemainingToday());
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/ai-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foods, mealType, energyLevel, userName }),
      });
      const data = await res.json();
      if (data.success && data.recipe) {
        setRecipe(data.recipe);
        setCachedRecipe(dayNumber, mealType, data.recipe);
        incrementUserStat('totalRecipesGenerated');
        setExpanded(true);
        onLoaded?.();
      } else {
        setError('Could not generate recipe. Try again.');
      }
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="rounded-2xl overflow-hidden mb-3"
      style={{
        background:   meta.bg,
        border:       `2px solid ${meta.border}`,
        boxShadow:    `0 4px 0 0 ${meta.border}`,
      }}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2">
          <meta.Icon className="w-5 h-5" style={{ color: meta.textColor }} />
          <div>
            <div className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5" style={{ color: meta.textColor }} />
              <span className="text-xs font-black tracking-wide uppercase" style={{ color: meta.textColor }}>
                AI Recipe
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-500">{meta.label}</span>
          </div>
        </div>

        {!recipe && !locked && (
          loading || treatsLeft > 0 ? (
            <motion.button
              onClick={handleGenerate}
              disabled={loading || foods.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white"
              style={{
                background:  loading ? '#d1d5db' : accent.color,
                boxShadow:   loading ? 'none' : `0 4px 0 0 ${accent.shadow}`,
                cursor:      loading ? 'not-allowed' : 'pointer',
              }}
              whileTap={loading ? {} : { scale: 0.95, y: 2, boxShadow: 'none' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span key="loading" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }} />
                    Generating...
                  </motion.span>
                ) : (
                  <motion.span key="idle" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Sparkles className="w-3 h-3" />
                    🍬 Suggest meal · {treatsLeft} treat{treatsLeft !== 1 ? 's' : ''} left
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-50 border border-amber-200 text-amber-700">
              🍬 Out of Treats! Resets tomorrow.
            </div>
          )
        )}

        {recipe && (
          <motion.button
            onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${meta.border}66` }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            >
              <ChevronDown className="w-4 h-4" style={{ color: meta.textColor }} />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Recipe summary row (always visible once generated) */}
      <AnimatePresence>
        {recipe && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="overflow-hidden"
          >
            <motion.button
              onClick={() => setExpanded(v => !v)}
              className="w-full px-4 pb-3 text-left"
              whileTap={{ scale: 0.99 }}
            >
              <h3 className="text-sm font-black text-gray-900">{recipe.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{recipe.tagline}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: meta.textColor }}>
                  <Clock className="w-3 h-3" /> {recipe.prepTime}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: meta.textColor }}>
                  <Zap className="w-3 h-3" /> {recipe.nutrition.calories} cal
                </span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded detail section */}
      <AnimatePresence>
        {recipe && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2" style={{ borderTop: `1.5px solid ${meta.border}` }}>
              {/* Nutrition strip */}
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {(['protein', 'carbs', 'fats', 'calories'] as const).map((key, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 24 }}
                    className="rounded-xl p-2 text-center"
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  >
                    <div className="text-xs font-black text-gray-800">{recipe.nutrition[key]}</div>
                    <div className="text-[10px] text-gray-500 capitalize">{key}</div>
                  </motion.div>
                ))}
              </div>

              {/* Ingredients */}
              <h4 className="font-black text-xs uppercase tracking-wide mb-2" style={{ color: meta.textColor }}>
                Ingredients
              </h4>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {recipe.ingredients.map((ing, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
                    className="text-xs rounded-xl px-2.5 py-1.5"
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  >
                    <span className="font-bold text-gray-900">{ing.amount}</span>{' '}
                    <span className="font-bold text-gray-900">{ing.item}</span>
                  </motion.div>
                ))}
              </div>

              {/* Steps */}
              <h4 className="font-black text-xs uppercase tracking-wide mb-2" style={{ color: meta.textColor }}>
                Instructions
              </h4>
              <div className="space-y-2 mb-4">
                {recipe.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
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

              {/* Tip */}
              {recipe.tip && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 24 }}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.6)', border: `1.5px solid ${meta.border}` }}
                >
                  <p className="text-xs text-gray-700">
                    <span className="font-black flex items-center gap-1"><Lightbulb className="w-3 h-3 inline text-yellow-500" /> Tip:</span> {recipe.tip}
                  </p>
                </motion.div>
              )}

              {/* Re-generate button — hidden for past days */}
              {!locked && <motion.button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-3 w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                style={{
                  background:  'rgba(255,255,255,0.7)',
                  border:      `1.5px solid ${meta.border}`,
                  color:       meta.textColor,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Sparkles className="w-3 h-3" />
                {loading ? 'Generating...' : 'New suggestion'}
              </motion.button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-500 text-center px-4 pb-3"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
