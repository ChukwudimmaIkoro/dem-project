'use client';

import { motion } from 'framer-motion';
import { Calendar, User, Trophy, Settings, ShoppingBasket } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'plan' | 'account' | 'progress' | 'settings' | 'pantry';
  onTabChange: (tab: 'plan' | 'account' | 'progress' | 'settings' | 'pantry') => void;
  accentColor?: string;
}

const TABS = [
  { id: 'plan'    as const, Icon: Calendar,        label: 'Plan'    },
  { id: 'progress'as const, Icon: Trophy,          label: 'Progress'},
  { id: 'pantry'  as const, Icon: ShoppingBasket,  label: 'Pantry'  },
  { id: 'account' as const, Icon: User,            label: 'Account' },
  { id: 'settings'as const, Icon: Settings,        label: 'Settings'},
];

export default function BottomNav({ activeTab, onTabChange, accentColor = '#22c55e' }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
      <div className="bg-white rounded-t-3xl flex justify-around items-stretch h-[68px] px-2"
           style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
        {TABS.map(({ id, Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative"
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-b-full"
                  style={{ backgroundColor: accentColor }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <motion.div
                animate={{
                  color: isActive ? accentColor : '#9ca3af',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>

              <span
                className="text-[11px] font-bold transition-colors duration-200"
                style={{ color: isActive ? accentColor : '#9ca3af' }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* iOS safe area */}
      <div className="bg-white" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
}
