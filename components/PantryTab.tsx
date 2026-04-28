'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { loadPantry, addPantryItem, removePantryItem, classifyMealTypes, PantryItem, MealType } from '@/lib/pantry';
import { Card } from './Card';

const MEAL_LABELS: { id: MealType; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch',     label: 'Lunch',     emoji: '☀️'  },
  { id: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { id: 'snack',     label: 'Snack',     emoji: '🍎' },
];

interface PantryTabProps {
  accentColor: string;
  accentDark: string;
  accentLight: string;
  accentText: string;
  inSheet?: boolean;
}

export default function PantryTab({ accentColor, accentDark, accentLight, accentText, inSheet }: PantryTabProps) {
  const [items,      setItems]      = useState<PantryItem[]>([]);
  const [draft,      setDraft]      = useState('');
  const [mealTypes,  setMealTypes]  = useState<MealType[]>([]);
  const [showChips,  setShowChips]  = useState(false);

  useEffect(() => { setItems(loadPantry()); }, []);

  const handleDraftChange = (val: string) => {
    setDraft(val);
    if (val.trim()) {
      const classified = classifyMealTypes(val);
      setMealTypes(classified);
      setShowChips(true);
    } else {
      setShowChips(false);
      setMealTypes([]);
    }
  };

  const toggleMealType = (id: MealType) => {
    setMealTypes(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed || mealTypes.length === 0) return;
    setItems(addPantryItem(trimmed, mealTypes));
    setDraft('');
    setMealTypes([]);
    setShowChips(false);
  };

  const handleRemove = (id: string) => setItems(removePantryItem(id));

  // Group items by meal type for display
  const grouped = MEAL_LABELS.map(m => ({
    ...m,
    items: items.filter(i => (i.mealTypes ?? []).includes(m.id)),
  })).filter(g => g.items.length > 0);

  return (
    <div className={`px-4 space-y-4 ${inSheet ? 'pt-4 pb-8' : 'pt-8 pb-28'}`}>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900">Pantry</h2>
        <p className="text-sm text-gray-400 mt-0.5">Ingredients here flow into your Diet tab meals.</p>
      </div>

      {/* Add item */}
      <Card>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Add an ingredient</p>

        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={e => handleDraftChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && mealTypes.length > 0 && handleAdd()}
            placeholder="e.g. Chicken breast, oats, apple..."
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 border-2 border-gray-200 outline-none transition-colors"
            style={{ borderColor: draft ? accentColor : undefined }}
          />
          <motion.button
            onClick={handleAdd}
            disabled={!draft.trim() || mealTypes.length === 0}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: accentColor, opacity: (draft.trim() && mealTypes.length > 0) ? 1 : 0.35 }}
            whileTap={(draft.trim() && mealTypes.length > 0) ? { scale: 0.92 } : {}}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Meal type chips — appear once user starts typing */}
        <AnimatePresence>
          {showChips && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-1.5">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wide">
                  Which meal? {mealTypes.length === 0 && <span className="text-red-400 normal-case font-semibold">Pick at least one</span>}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {MEAL_LABELS.map(({ id, label, emoji }) => {
                    const on = mealTypes.includes(id);
                    return (
                      <motion.button
                        key={id}
                        onClick={() => toggleMealType(id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border-2 transition-colors"
                        style={{
                          background:  on ? accentLight : '#f9fafb',
                          borderColor: on ? accentColor : '#e5e7eb',
                          color:       on ? accentText  : '#6b7280',
                        }}
                        whileTap={{ scale: 0.92 }}
                      >
                        {emoji} {label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Items grouped by meal */}
      {grouped.length > 0 ? (
        grouped.map(group => (
          <Card key={group.id}>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">
              {group.emoji} {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.items.map(item => (
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
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-10 space-y-2">
          <p className="text-4xl">🧺</p>
          <p className="text-sm font-bold text-gray-400">Your pantry is empty</p>
          <p className="text-xs text-gray-300">Add ingredients above — they&apos;ll appear in your Diet tab meals.</p>
        </div>
      )}

    </div>
  );
}
