'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EnergyLevel } from '@/types';

interface EnergyModalProps {
  isOpen: boolean;
  currentEnergy: EnergyLevel;
  onSelect: (energy: EnergyLevel) => void;
  dayNumber: number;
}

const ENERGY_OPTIONS = [
  {
    level:       'high' as EnergyLevel,
    color:       '#22c55e',
    shadowColor: '#15803d',
    bg:          '#f0fdf4',
    label:       'High Energy',
    emoji:       '🔥',
    description: "Let's crush it today!",
  },
  {
    level:       'medium' as EnergyLevel,
    color:       '#eab308',
    shadowColor: '#a16207',
    bg:          '#fefce8',
    label:       'Medium Energy',
    emoji:       '⚡',
    description: 'Feeling balanced and steady.',
  },
  {
    level:       'low' as EnergyLevel,
    color:       '#3b82f6',
    shadowColor: '#1d4ed8',
    bg:          '#eff6ff',
    label:       'Low Energy',
    emoji:       '💙',
    description: 'Taking it easy today.',
  },
] as const;

export default function EnergyModal({ isOpen, currentEnergy, onSelect, dayNumber }: EnergyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="w-full max-w-md bg-white rounded-4xl overflow-hidden"
            style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.22)' }}
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0,  opacity: 1, scale: 1   }}
            exit={{   y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Day {dayNumber}</p>
              <h2 className="text-2xl font-black text-gray-900">How's your energy?</h2>
              <p className="text-sm text-gray-500 mt-1">Your plan will adapt to match.</p>
            </div>

            {/* Energy options */}
            <div className="p-4 space-y-3">
              {ENERGY_OPTIONS.map(({ level, color, shadowColor, bg, label, emoji, description }) => {
                const isSelected = currentEnergy === level;

                return (
                  <motion.button
                    key={level}
                    onClick={() => onSelect(level)}
                    className="w-full rounded-2xl text-left overflow-hidden"
                    style={{
                      background: bg,
                      border: `2.5px solid ${isSelected ? color : 'transparent'}`,
                      boxShadow: isSelected
                        ? `0 0 0 3px ${color}33, 0 4px 0 0 ${shadowColor}44`
                        : `0 4px 0 0 ${color}33`,
                      padding: '14px 18px',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97, y: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${color}22` }}
                      >
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-base text-gray-900">{label}</div>
                        <div className="text-sm text-gray-500 truncate">{description}</div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: color }}
                        >
                          <span className="text-white text-sm font-black">✓</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="px-4 pb-6">
              <p className="text-xs text-gray-400 text-center">
                Tap your mascot anytime to update your energy.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
