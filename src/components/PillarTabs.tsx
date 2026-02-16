'use client';

import { Utensils, Dumbbell, Brain } from 'lucide-react';

interface PillarTabsProps {
  activePillar: 'diet' | 'exercise' | 'mentality';
  onPillarChange: (pillar: 'diet' | 'exercise' | 'mentality') => void;
  completedPillars: {
    diet: boolean;
    exercise: boolean;
    mentality: boolean;
  };
}

export default function PillarTabs({ activePillar, onPillarChange, completedPillars }: PillarTabsProps) {
  const pillars = [
    { id: 'diet' as const, label: 'D', Icon: Utensils, color: 'bg-dem-green-500' },
    { id: 'exercise' as const, label: 'E', Icon: Dumbbell, color: 'bg-dem-blue-500' },
    { id: 'mentality' as const, label: 'M', Icon: Brain, color: 'bg-dem-purple-500' },
  ];

  return (
    <div className="flex justify-center gap-2 mb-6">
      {pillars.map(({ id, label, Icon, color }) => {
        const isActive = activePillar === id;
        const isCompleted = completedPillars[id];
        
        return (
          <button
            key={id}
            onClick={() => onPillarChange(id)}
            className={`
              relative w-16 h-16 rounded-2xl font-bold text-lg transition-all
              ${isActive 
                ? `${color} text-white scale-110 shadow-lg` 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }
            `}
          >
            <div className="flex flex-col items-center justify-center">
              <Icon className="w-6 h-6 mb-0.5" />
              <div className="text-xs">{label}</div>
            </div>
            
            {/* Completion checkmark */}
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-dem-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}