'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Dumbbell, Brain } from 'lucide-react';

interface PillarTabsProps {
  activePillar: 'diet' | 'exercise' | 'mentality';
  onPillarChange: (pillar: 'diet' | 'exercise' | 'mentality') => void;
  completedPillars: { diet: boolean; exercise: boolean; mentality: boolean };
}

const PILLARS = [
  { id: 'diet'      as const, label: 'Diet',      Icon: Utensils, color: '#22c55e', bg: '#dcfce7' },
  { id: 'exercise'  as const, label: 'Exercise',   Icon: Dumbbell, color: '#3b82f6', bg: '#dbeafe' },
  { id: 'mentality' as const, label: 'Mentality',  Icon: Brain,    color: '#a855f7', bg: '#f3e8ff' },
];

export default function PillarTabs({ activePillar, onPillarChange, completedPillars }: PillarTabsProps) {
  return (
    <div className="flex gap-2 mb-5">
      {PILLARS.map(({ id, label, Icon, color, bg }) => {
        const isActive    = activePillar === id;
        const isCompleted = completedPillars[id];

        return (
          <div key={id} className="flex-1 relative">
            <motion.button
              onClick={() => onPillarChange(id)}
              className="w-full relative rounded-2xl"
              style={{
                padding: '10px 0',
                background: isActive ? color : '#f3f4f6',
                boxShadow: isActive
                  ? `0 4px 0 0 ${color}66, 0 2px 8px ${color}33`
                  : '0 2px 0 0 #d1d5db',
              }}
              whileTap={{ scale: 0.95, y: 2 }}
              animate={{
                background: isActive ? color : '#f3f4f6',
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <Icon
                  className="w-5 h-5"
                  style={{ color: isActive ? 'white' : '#6b7280' }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: isActive ? 'white' : '#6b7280' }}
                >
                  {label}
                </span>
              </div>
            </motion.button>

            {/* Completion badge — outside button so it's never clipped */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
                  style={{ background: '#22c55e', border: '2px solid white' }}
                >
                  <span className="text-white text-[10px] font-black">✓</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
