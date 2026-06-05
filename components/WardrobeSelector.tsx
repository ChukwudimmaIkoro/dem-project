'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MASCOT_HATS, MASCOT_EYEWEAR, MASCOT_BADGES,
  MASCOT_SHOES, MASCOT_BACK_BLING, MASCOT_MINI_BUDDIES,
  ENERGY_CONFIG,
} from './Mascot';

interface Props {
  currentHat?: string;
  currentEyewear?: string;
  energyLevel?: 'low' | 'medium' | 'high';
  currentBadge?: string;
  currentShoes?: string;
  currentBackBling?: string;
  currentMiniBuddy?: string;
  userTier?: string;
  accentColor: string;
  accentLight: string;
  accentText: string;
  onSelect: (hat: string, eyewear: string, badge: string, shoes: string, backBling: string, miniBuddy: string) => void;
}

type Category = 'hat' | 'eyewear' | 'badge' | 'shoes' | 'backBling' | 'miniBuddy';

const TABS: { id: Category; label: string; emoji: string }[] = [
  { id: 'eyewear',   label: 'Eyewear', emoji: '👓' },
  { id: 'badge',     label: 'Badges',  emoji: '⭐' },
  { id: 'shoes',     label: 'Shoes',   emoji: '👟' },
  { id: 'backBling', label: 'Back',    emoji: '🦸' },
  { id: 'miniBuddy', label: 'Buddy',   emoji: '💗' },
];

function canEquip(itemTier: string, userTier: string): boolean {
  if (itemTier === 'basic') return true;
  return userTier === 'plus' || userTier === 'premium';
}

export default function WardrobeSelector({
  currentHat = '', currentEyewear = '', currentBadge = '',
  currentShoes = '', currentBackBling = '', currentMiniBuddy = '',
  userTier = 'basic', energyLevel = 'medium',
  accentColor, accentLight, accentText, onSelect,
}: Props) {
  const [tab,        setTab]        = useState<Category>('eyewear');
  const [hat,        setHat]        = useState(currentHat);
  const [eyewear,    setEyewear]    = useState(currentEyewear);
  const [badge,      setBadge]      = useState(currentBadge);
  const [shoes,      setShoes]      = useState(currentShoes);
  const [backBling,  setBackBling]  = useState(currentBackBling);
  const [miniBuddy,  setMiniBuddy]  = useState(currentMiniBuddy);

  const choose = (id: string) => {
    const toggle = (cur: string) => cur === id ? '' : id;
    if (tab === 'hat')       { const v = toggle(hat);       setHat(v);       onSelect(v, eyewear, badge, shoes, backBling, miniBuddy); }
    else if (tab === 'eyewear')   { const v = toggle(eyewear);   setEyewear(v);   onSelect(hat, v, badge, shoes, backBling, miniBuddy); }
    else if (tab === 'badge')     { const v = toggle(badge);     setBadge(v);     onSelect(hat, eyewear, v, shoes, backBling, miniBuddy); }
    else if (tab === 'shoes')     { const v = toggle(shoes);     setShoes(v);     onSelect(hat, eyewear, badge, v, backBling, miniBuddy); }
    else if (tab === 'backBling') { const v = toggle(backBling); setBackBling(v); onSelect(hat, eyewear, badge, shoes, v, miniBuddy); }
    else                          { const v = toggle(miniBuddy); setMiniBuddy(v); onSelect(hat, eyewear, badge, shoes, backBling, v); }
  };

  const allItems = {
    hat: MASCOT_HATS, eyewear: MASCOT_EYEWEAR, badge: MASCOT_BADGES,
    shoes: MASCOT_SHOES, backBling: MASCOT_BACK_BLING, miniBuddy: MASCOT_MINI_BUDDIES,
  };
  const selectedId = { hat, eyewear, badge, shoes, backBling, miniBuddy }[tab];
  const items = allItems[tab] as { id: string; name: string; emoji: string; tier: string }[];


  return (
    <div className="space-y-3">
      {/* Mascot preview */}
      <div className="flex justify-center py-2">
        <svg width="72" height="72" viewBox="-25 -10 150 130" style={{ overflow: 'visible' }}>
          {backBling && MASCOT_BACK_BLING.find(b => b.id === backBling)?.svgPath}
          <circle cx="50" cy="50" r="44" fill={ENERGY_CONFIG[energyLevel].color} />
          <ellipse cx="35" cy="28" rx="13" ry="9" fill="rgba(255,255,255,0.28)" />
          <ellipse cx="34" cy="44" rx="5.5" ry="6.5" fill="white" />
          <ellipse cx="66" cy="44" rx="5.5" ry="6.5" fill="white" />
          <circle cx="35.5" cy="45.5" r="3.8" fill="#1a1a2e" />
          <circle cx="67.5" cy="45.5" r="3.8" fill="#1a1a2e" />
          <circle cx="37.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
          <circle cx="69.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
          <path d="M 37 57 Q 50 70 63 57" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {eyewear   && MASCOT_EYEWEAR.find(e => e.id === eyewear)?.svgPath}
          {badge     && MASCOT_BADGES.find(b => b.id === badge)?.svgPath}
          {shoes     && MASCOT_SHOES.find(s => s.id === shoes)?.svgPath}
          {miniBuddy && MASCOT_MINI_BUDDIES.find(m => m.id === miniBuddy)?.svgPath}
        </svg>
      </div>

      {/* Category tabs — 2 rows of 3 */}
      <div className="grid grid-cols-3 gap-1.5">
        {TABS.map(t => (
          <motion.button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="py-1.5 rounded-xl text-xs font-black transition-colors"
            style={{
              background: tab === t.id ? accentColor : '#f3f4f6',
              color:      tab === t.id ? 'white' : '#6b7280',
              boxShadow:  tab === t.id ? `0 2px 0 0 ${accentColor}88` : '0 2px 0 0 #d1d5db',
            }}
            whileTap={{ scale: 0.95, y: 1, boxShadow: 'none' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {t.emoji} {t.label}
          </motion.button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-4 gap-2">
        {items.map(item => {
          const isOn     = selectedId === item.id;
          const unlocked = canEquip(item.tier, userTier);
          return (
            <motion.button
              key={item.id}
              onClick={() => unlocked && choose(item.id)}
              className="flex flex-col items-center gap-1 py-2 rounded-2xl border-2 relative transition-colors"
              style={{
                background:   isOn ? accentLight : unlocked ? '#f9fafb' : '#f3f4f6',
                borderColor:  isOn ? accentColor : '#e5e7eb',
                opacity:      unlocked ? 1 : 0.55,
                cursor:       unlocked ? 'pointer' : 'default',
              }}
              whileTap={unlocked ? { scale: 0.9 } : {}}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[9px] font-bold text-gray-500 leading-tight text-center px-0.5">{item.name}</span>
              {!unlocked && (
                <span className="absolute top-1 right-1 text-[8px] font-black text-gray-400">🔒 Sub</span>
              )}
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
