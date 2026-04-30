'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Pencil } from 'lucide-react';

interface Props {
  initialValue: string;
  accentColor: string;
  accentDark: string;
  onSave: (habit: string) => void;
}

export default function DemPlusHabitInput({ initialValue, accentColor, accentDark, onSave }: Props) {
  const [editing, setEditing] = useState(!initialValue);
  const [value,   setValue]   = useState(initialValue);
  const [draft,   setDraft]   = useState(initialValue);
  const [saved,   setSaved]   = useState(false);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setValue(trimmed);
    setEditing(false);
    onSave(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  if (!editing && value) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800"
          style={{ background: '#f9fafb', border: '2px solid #e5e7eb' }}>
          {value}
        </div>
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: accentColor }}>
              <Check className="w-4 h-4 text-white" />
            </motion.div>
          ) : (
            <motion.button key="edit" onClick={() => { setDraft(value); setEditing(true); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100"
              whileTap={{ scale: 0.9 }}>
              <Pencil className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && commit()}
        placeholder="e.g. Drink 8 glasses of water"
        maxLength={80}
        autoFocus
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none border-2 transition-colors"
        style={{ borderColor: draft ? accentColor : '#e5e7eb' }}
      />
      <motion.button
        onClick={commit}
        disabled={!draft.trim()}
        className="w-full py-3 rounded-2xl text-sm font-black text-white"
        style={{ background: accentColor, boxShadow: `0 4px 0 0 ${accentDark}`, opacity: draft.trim() ? 1 : 0.5 }}
        whileTap={draft.trim() ? { scale: 0.97, y: 2, boxShadow: 'none' } : {}}
      >
        Set My Habit
      </motion.button>
    </div>
  );
}
