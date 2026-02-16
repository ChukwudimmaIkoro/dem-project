'use client';

import { EnergyLevel } from '@/types';
import { Button } from './Button';
import { Card } from './Card';
import { Zap } from 'lucide-react';

interface EnergyModalProps {
  isOpen: boolean;
  currentEnergy: EnergyLevel;
  onSelect: (energy: EnergyLevel) => void;
  dayNumber: number;
}

export default function EnergyModal({ isOpen, currentEnergy, onSelect, dayNumber }: EnergyModalProps) {
  if (!isOpen) return null;

  const energyOptions: { level: EnergyLevel; color: string; bg: string; label: string; description: string }[] = [
    {
      level: 'high',
      color: 'text-dem-green-600',
      bg: 'bg-dem-green-500 hover:bg-dem-green-600',
      label: 'High Energy',
      description: 'Ready to crush it! 💪'
    },
    {
      level: 'medium',
      color: 'text-dem-yellow-600',
      bg: 'bg-dem-yellow-400 hover:bg-dem-yellow-500',
      label: 'Medium Energy',
      description: 'Feeling balanced ⚖️'
    },
    {
      level: 'low',
      color: 'text-dem-blue-600',
      bg: 'bg-dem-blue-500 hover:bg-dem-blue-600',
      label: 'Low Energy',
      description: 'Taking it easy today 😌'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
      <Card className="max-w-sm w-full animate-bounce-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Day {dayNumber}
          </h2>
          <p className="text-gray-600">
            How's your energy today?
          </p>
        </div>

        <div className="space-y-3">
          {energyOptions.map(({ level, color, bg, label, description }) => (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className={`
                w-full p-4 rounded-2xl text-white font-bold transition-all
                ${bg}
                ${currentEnergy === level ? 'ring-4 ring-offset-2 ring-gray-800' : ''}
                active:scale-95
              `}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg">{label}</div>
                  <div className="text-sm opacity-90">{description}</div>
                </div>
                <Zap className="w-8 h-8" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your plan will adapt to your energy level
        </p>
      </Card>
    </div>
  );
}