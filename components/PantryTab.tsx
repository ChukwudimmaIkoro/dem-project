'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, ChefHat, RefreshCw } from 'lucide-react';
import { loadPantry, addPantryItem, removePantryItem, PantryItem } from '@/lib/pantry';
import { loadAppState } from '@/lib/storage';
import { EnergyLevel } from '@/types';
import { Card } from './Card';

interface CachedPantryRecipe {
  name: string;
  tagline: string;
  prepTime: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  nutrition: { protein: string; carbs: string; fats: string; calories: string };
  tip: string;
}

interface PantryTabProps {
  energy: EnergyLevel;
  accentColor: string;
  accentDark: string;
  accentLight: string;
  accentText: string;
}

export default function PantryTab({ energy, accentColor, accentDark, accentLight, accentText }: PantryTabProps) {
  const [items,    setItems]    = useState<PantryItem[]>([]);
  const [draft,    setDraft]    = useState('');
  const [recipe,   setRecipe]   = useState<CachedPantryRecipe | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showRecipe, setShowRecipe] = useState(false);

  useEffect(() => { setItems(loadPantry()); }, []);

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setItems(addPantryItem(trimmed));
    setDraft('');
  };

  const handleRemove = (id: string) => {
    setItems(removePantryItem(id));
    setRecipe(null);
    setShowRecipe(false);
  };

  const handleCook = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    setShowRecipe(false);
    try {
      const userName = loadAppState().user?.name ?? '';
      const res = await fetch('/api/ai-pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pantryItems: items.map(i => i.name), energyLevel: energy, userName }),
      });
      const data = await res.json();
      if (!data.success || !data.recipe) throw new Error('No recipe returned');
      setRecipe(data.recipe);
      setShowRecipe(true);
    } catch {
      setError('Could not generate a recipe. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 pb-28 px-4 space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900">Pantry</h2>
        <p className="text-sm text-gray-400 mt-0.5">Add what you have. Cook from it.</p>
      </div>

      {/* Add item */}
      <Card>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">What&apos;s in your pantry?</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Chicken, rice, broccoli..."
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 border-2 border-gray-200 outline-none transition-colors"
            style={{ borderColor: draft ? accentColor : undefined }}
          />
          <motion.button
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: accentColor, opacity: draft.trim() ? 1 : 0.4 }}
            whileTap={draft.trim() ? { scale: 0.92 } : {}}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Item list */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="flex flex-wrap gap-2 mt-3"
            >
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
                  style={{ background: accentLight, color: accentText }}
                >
                  <span>{item.name}</span>
                  <button onClick={() => handleRemove(item.id)} className="opacity-60 hover:opacity-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Cook from pantry CTA */}
      {items.length > 0 && (
        <motion.button
          onClick={handleCook}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-base font-black text-white flex items-center justify-center gap-2"
          style={{ background: accentColor, boxShadow: `0 5px 0 0 ${accentDark}`, opacity: loading ? 0.8 : 1 }}
          whileTap={loading ? {} : { scale: 0.97, y: 2, boxShadow: 'none' }}
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Cooking something up...</>
            : <><ChefHat className="w-5 h-5" /> Cook From Pantry</>
          }
        </motion.button>
      )}

      {items.length === 0 && (
        <div className="text-center py-10 space-y-2">
          <p className="text-4xl">🧺</p>
          <p className="text-sm font-bold text-gray-400">Your pantry is empty</p>
          <p className="text-xs text-gray-300">Add ingredients above to get a recipe from what you have.</p>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-500 bg-red-50 rounded-xl px-3 py-2 text-center">{error}</p>
      )}

      {/* Recipe result */}
      <AnimatePresence>
        {showRecipe && recipe && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Card>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-black text-gray-900 text-base leading-tight">{recipe.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 italic">{recipe.tagline}</p>
                </div>
                <button
                  onClick={handleCook}
                  className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100"
                  title="Generate another"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Macros */}
              <div className="flex gap-2 mb-4">
                {[
                  { label: 'Protein', val: recipe.nutrition.protein },
                  { label: 'Carbs',   val: recipe.nutrition.carbs },
                  { label: 'Fats',    val: recipe.nutrition.fats },
                  { label: 'Cal',     val: recipe.nutrition.calories },
                ].map(({ label, val }) => (
                  <div key={label} className="flex-1 rounded-xl p-2 text-center" style={{ background: accentLight }}>
                    <p className="text-xs font-black" style={{ color: accentText }}>{val}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                  </div>
                ))}
              </div>

              {/* Ingredients */}
              <div className="mb-3">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Ingredients</p>
                <div className="space-y-1">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{ing.item}</span>
                      <span className="text-gray-400 font-semibold text-xs">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="mb-3">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-2">Steps</p>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white mt-0.5"
                        style={{ background: accentColor }}>
                        {i + 1}
                      </span>
                      <span className="text-gray-600 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tip */}
              <div className="rounded-xl px-3 py-2.5" style={{ background: accentLight }}>
                <p className="text-xs font-black uppercase tracking-wide mb-0.5" style={{ color: accentText }}>Pro Tip</p>
                <p className="text-xs text-gray-600 leading-relaxed">{recipe.tip}</p>
              </div>

              <p className="text-[10px] text-gray-300 text-center mt-3">Prep time: {recipe.prepTime}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
