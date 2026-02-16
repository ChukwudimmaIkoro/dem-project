'use client';

import { Calendar, User, Trophy } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'plan' | 'account' | 'progress';
  onTabChange: (tab: 'plan' | 'account' | 'progress') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'plan' as const, icon: Calendar, label: 'Plan' },
    { id: 'progress' as const, icon: Trophy, label: 'Progress' },
    { id: 'account' as const, icon: User, label: 'Account' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg max-w-md mx-auto">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                flex-1 flex flex-col items-center justify-center h-full transition-all
                ${isActive 
                  ? 'text-dem-green-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <Icon 
                className={`w-6 h-6 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} 
              />
              <span className="text-xs font-semibold">{label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-dem-green-500 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}