'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MASCOT_HATS, MASCOT_EYEWEAR, MASCOT_BADGES } from './Mascot';

interface Props {
  currentHat: string;
  currentEyewear?: string;
  currentBadge?: string;
  accentColor: string;
  accentLight: string;
  accentText: string;
  onSelect: (hatId: string, eyewearId: string, badgeId: string) => void;
}

type Category = 'hat' | 'eyewear' | 'badge';

const TABS: { id: Category; label: string; emoji: string }[] = [
  { id: 'hat',    label: 'Hats',    emoji: '🎩' },
  { id: 'eyewear', label: 'Eyewear', emoji: '👓' },
  { id: 'badge',  label: 'Badges',  emoji: '⭐' },
];

export default function WardrobeSelector({
  currentHat, currentEyewear = '', currentBadge = '',
  accentColor, accentLight, accentText, onSelect,
}: Props) {
  const [tab,      setTab]      = useState<Category>('hat');
  const [hat,      setHat]      = useState(currentHat);
  const [eyewear,  setEyewear]  = useState(currentEyewear);
  const [badge,    setBadge]    = useState(currentBadge);

  const choose = (id: string) => {
    if (tab === 'hat') {
      const next = hat === id ? '' : id;
      setHat(next);
      onSelect(next, eyewear, badge);
    } else if (tab === 'eyewear') {
      const next = eyewear === id ? '' : id;
      setEyewear(next);
      onSelect(hat, next, badge);
    } else {
      const next = badge === id ? '' : id;
      setBadge(next);
      onSelect(hat, eyewear, next);
    }
  };

  const items = tab === 'hat' ? MASCOT_HATS : tab === 'eyewear' ? MASCOT_EYEWEAR : MASCOT_BADGES;
  const selectedId = tab === 'hat' ? hat : tab === 'eyewear' ? eyewear : badge;

  return (
    <div className="space-y-3">
      {/* Mascot preview */}
      <div className="flex justify-center py-2">
        <svg width="72" height="72" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="#22c55e" />
          <ellipse cx="35" cy="28" rx="13" ry="9" fill="rgba(255,255,255,0.28)" />
          <ellipse cx="34" cy="44" rx="5.5" ry="6.5" fill="white" />
          <ellipse cx="66" cy="44" rx="5.5" ry="6.5" fill="white" />
          <circle cx="35.5" cy="45.5" r="3.8" fill="#1a1a2e" />
          <circle cx="67.5" cy="45.5" r="3.8" fill="#1a1a2e" />
          <circle cx="37.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
          <circle cx="69.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
          <path d="M 37 57 Q 50 70 63 57" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {hat     && MASCOT_HATS.find(h => h.id === hat)?.svgPath}
          {eyewear && MASCOT_EYEWEAR.find(e => e.id === eyewear)?.svgPath}
          {badge   && MASCOT_BADGES.find(b => b.id === badge)?.svgPath}
        </svg>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5">
        {TABS.map(t => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-1.5 rounded-xl text-xs font-black transition-colors"
            style={{
              background:  tab === t.id ? accentColor : '#f3f4f6',
              color:       tab === t.id ? 'white' : '#6b7280',
              boxShadow:   tab === t.id ? `0 2px 0 0 ${accentColor}88` : '0 2px 0 0 #d1d5db',
            }}
            whileTap={{ scale: 0.95, y: 1, boxShadow: 'none' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {t.emoji} {t.label}
          </motion.button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-5 gap-2">
        {items.map(item => {
          const isOn = selectedId === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => choose(item.id)}
              className="flex flex-col items-center gap-1 py-2 rounded-2xl border-2 transition-colors"
              style={{
                background:  isOn ? accentLight : '#f9fafb',
                borderColor: isOn ? accentColor : '#e5e7eb',
              }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[9px] font-bold text-gray-500 leading-tight text-center px-0.5">{item.name}</span>
            </motion.button>
          );
        })}
      </div>

      {selectedId ? (
        <p className="text-xs text-center font-semibold" style={{ color: accentText }}>
          Wearing: {items.find(i => i.id === selectedId)?.name} {items.find(i => i.id === selectedId)?.emoji}
          {' · '}
          <button className="underline" onClick={() => choose(selectedId)}>Remove</button>
        </p>
      ) : (
        <p className="text-xs text-center text-gray-400">Tap an item to try it on</p>
      )}
    </div>
  );
}
