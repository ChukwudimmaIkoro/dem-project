'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MASCOT_HATS } from './Mascot';

interface Props {
  currentHat: string;
  accentColor: string;
  accentLight: string;
  accentText: string;
  onSelect: (hatId: string) => void;
}

export default function WardrobeSelector({ currentHat, accentColor, accentLight, accentText, onSelect }: Props) {
  const [selected, setSelected] = useState(currentHat);

  const choose = (id: string) => {
    const next = selected === id ? '' : id; // tap same hat to remove it
    setSelected(next);
    onSelect(next);
  };

  return (
    <div className="space-y-3">
      {/* Mascot preview */}
      <div className="flex justify-center py-2">
        <div className="relative">
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
            {selected && MASCOT_HATS.find(h => h.id === selected)?.svgPath}
          </svg>
        </div>
      </div>

      {/* Hat grid */}
      <div className="grid grid-cols-5 gap-2">
        {MASCOT_HATS.map(hat => {
          const isOn = selected === hat.id;
          return (
            <motion.button
              key={hat.id}
              onClick={() => choose(hat.id)}
              className="flex flex-col items-center gap-1 py-2 rounded-2xl border-2 transition-colors"
              style={{
                background:   isOn ? accentLight : '#f9fafb',
                borderColor:  isOn ? accentColor : '#e5e7eb',
              }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-xl">{hat.emoji}</span>
              <span className="text-[9px] font-bold text-gray-500 leading-tight text-center px-0.5">{hat.name}</span>
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <p className="text-xs text-center font-semibold" style={{ color: accentText }}>
          Wearing: {MASCOT_HATS.find(h => h.id === selected)?.name} {MASCOT_HATS.find(h => h.id === selected)?.emoji}
          {' · '}
          <button className="underline" onClick={() => choose(selected)}>Remove</button>
        </p>
      )}
      {!selected && (
        <p className="text-xs text-center text-gray-400">Tap a hat to try it on</p>
      )}
    </div>
  );
}
