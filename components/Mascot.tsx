'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MascotProps {
  message?: string;
  mood?: 'happy' | 'excited' | 'calm' | 'encouraging' | 'thinking';
  className?: string;
  persistent?: boolean;
  currentEnergy?: 'low' | 'medium' | 'high';
  userName?: string;
  dayNumber?: number;
  completedTasks?: string[];
  streak?: number;
  pillar?: 'diet' | 'exercise' | 'mentality' | 'habit';
  size?: number;
  suppressBubble?: boolean;
  hat?: string;
  eyewear?: string;
  badge?: string;
  shoes?: string;
  backBling?: string;
  miniBuddy?: string;
}

// ─── Hat definitions ─────────────────────────────────────────────────────────────

export interface MascotHat {
  id: string;
  name: string;
  emoji: string;
  tier: 'basic' | 'plus' | 'premium';
  svgPath: React.ReactNode;
}

export const MASCOT_HATS: MascotHat[] = [
  {
    id: 'party', name: 'Party Hat', emoji: '🎉', tier: 'basic',
    svgPath: (
      <g>
        <polygon points="50,2 30,38 70,38" fill="#f97316" />
        <polygon points="50,2 38,22 62,22" fill="#fbbf24" />
        <circle cx="50" cy="2" r="3" fill="#f43f5e" />
        <ellipse cx="50" cy="38" rx="21" ry="5" fill="#fb923c" />
      </g>
    ),
  },
  {
    id: 'beanie', name: 'Beanie', emoji: '🧢', tier: 'basic',
    svgPath: (
      <g>
        <ellipse cx="50" cy="38" rx="22" ry="6" fill="#6366f1" />
        <path d="M28,38 Q28,10 50,10 Q72,10 72,38" fill="#818cf8" />
        <circle cx="50" cy="11" r="4" fill="#f43f5e" />
        <line x1="28" y1="32" x2="72" y2="32" stroke="#4f46e5" strokeWidth="2.5" />
      </g>
    ),
  },
  {
    id: 'crown', name: 'Crown', emoji: '👑', tier: 'plus',
    svgPath: (
      <g>
        <polygon points="29,38 29,20 38,30 50,10 62,30 71,20 71,38" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="50" cy="11" r="3.5" fill="#f43f5e" />
        <circle cx="29" cy="20" r="2.5" fill="#60a5fa" />
        <circle cx="71" cy="20" r="2.5" fill="#34d399" />
      </g>
    ),
  },
  {
    id: 'bow', name: 'Bow', emoji: '🎀', tier: 'plus',
    svgPath: (
      <g>
        <ellipse cx="38" cy="28" rx="10" ry="7" fill="#f9a8d4" />
        <ellipse cx="62" cy="28" rx="10" ry="7" fill="#f9a8d4" />
        <circle cx="50" cy="28" r="5" fill="#ec4899" />
        <ellipse cx="38" cy="28" rx="10" ry="7" fill="none" stroke="#ec4899" strokeWidth="1.2" />
        <ellipse cx="62" cy="28" rx="10" ry="7" fill="none" stroke="#ec4899" strokeWidth="1.2" />
      </g>
    ),
  },
  {
    id: 'bucket_hat', name: 'Bucket Hat', emoji: '🪣', tier: 'plus',
    svgPath: (
      <g>
        <path d="M29,36 Q29,14 50,14 Q71,14 71,36" fill="#9ca3af" />
        <ellipse cx="50" cy="36" rx="24" ry="5" fill="#6b7280" />
        <line x1="30" y1="28" x2="70" y2="28" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'flower_crown', name: 'Flower Crown', emoji: '🌸', tier: 'plus',
    svgPath: (
      <g>
        <path d="M26,34 Q38,27 50,25 Q62,27 74,34" fill="none" stroke="#86efac" strokeWidth="3" strokeLinecap="round" />
        <circle cx="34" cy="30" r="4" fill="#f9a8d4" /><circle cx="34" cy="30" r="2" fill="#fbbf24" />
        <circle cx="50" cy="25" r="4" fill="#c4b5fd" /><circle cx="50" cy="25" r="2" fill="#fbbf24" />
        <circle cx="66" cy="30" r="4" fill="#fda4af" /><circle cx="66" cy="30" r="2" fill="#fbbf24" />
      </g>
    ),
  },
  {
    id: 'tophat', name: 'Top Hat', emoji: '🎩', tier: 'premium',
    svgPath: (
      <g>
        <rect x="34" y="12" width="32" height="26" rx="3" fill="#1e293b" />
        <rect x="26" y="36" width="48" height="6" rx="3" fill="#334155" />
        <rect x="38" y="14" width="24" height="4" rx="1" fill="#64748b" opacity="0.4" />
      </g>
    ),
  },
  {
    id: 'halo', name: 'Halo', emoji: '😇', tier: 'premium',
    svgPath: (
      <g>
        <ellipse cx="50" cy="8" rx="18" ry="5" fill="none" stroke="#fbbf24" strokeWidth="3.5" opacity="0.95" />
        <ellipse cx="50" cy="8" rx="18" ry="5" fill="none" stroke="#fef9c3" strokeWidth="1.5" opacity="0.7" />
      </g>
    ),
  },
  {
    id: 'chef_hat', name: 'Chef Hat', emoji: '👨‍🍳', tier: 'premium',
    svgPath: (
      <g>
        <circle cx="40" cy="22" r="10" fill="white" />
        <circle cx="60" cy="22" r="10" fill="white" />
        <circle cx="50" cy="16" r="12" fill="white" />
        <rect x="30" y="30" width="40" height="8" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="30" y1="33" x2="70" y2="33" stroke="#e5e7eb" strokeWidth="1" />
      </g>
    ),
  },
];

// ─── Eyewear definitions ─────────────────────────────────────────────────────────

export interface MascotEyewear {
  id: string;
  name: string;
  emoji: string;
  tier: 'basic' | 'plus' | 'premium';
  svgPath: React.ReactNode;
}

export const MASCOT_EYEWEAR: MascotEyewear[] = [
  {
    id: 'sunglasses', name: 'Sunglasses', emoji: '🕶️', tier: 'basic',
    svgPath: (
      <g>
        <rect x="25" y="38" width="19" height="13" rx="4" fill="#111827" opacity="0.92" />
        <rect x="56" y="38" width="19" height="13" rx="4" fill="#111827" opacity="0.92" />
        <line x1="44" y1="44" x2="56" y2="44" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="43" x2="15" y2="46" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="74" y1="43" x2="85" y2="46" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="30" cy="41" rx="4" ry="2.5" fill="rgba(255,255,255,0.16)" />
        <ellipse cx="61" cy="41" rx="4" ry="2.5" fill="rgba(255,255,255,0.16)" />
      </g>
    ),
  },
  {
    id: 'round_glasses', name: 'Round Glasses', emoji: '👓', tier: 'plus',
    svgPath: (
      <g>
        {/* Left lens — clear blue tint, brown frame */}
        <circle cx="34" cy="44" r="9" fill="rgba(186,230,253,0.6)" stroke="#92400e" strokeWidth="2.5" />
        {/* Right lens */}
        <circle cx="66" cy="44" r="9" fill="rgba(186,230,253,0.6)" stroke="#92400e" strokeWidth="2.5" />
        {/* Bridge */}
        <line x1="43" y1="44" x2="57" y2="44" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
        {/* Temples */}
        <line x1="25" y1="43" x2="15" y2="46" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
        <line x1="74" y1="43" x2="85" y2="46" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
        {/* Lens highlights */}
        <ellipse cx="30" cy="41" rx="4" ry="2.5" fill="rgba(255,255,255,0.5)" />
        <ellipse cx="62" cy="41" rx="4" ry="2.5" fill="rgba(255,255,255,0.5)" />
      </g>
    ),
  },
  {
    id: 'goggles', name: 'Goggles', emoji: '🥽', tier: 'plus',
    svgPath: (
      <g>
        {/* Wide rubber strap going around head */}
        <path d="M22,40 Q14,44 14,47 Q14,50 22,53" stroke="#1f2937" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M78,40 Q86,44 86,47 Q86,50 78,53" stroke="#1f2937" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Left goggle — rubber outer ring + lens */}
        <ellipse cx="33" cy="46" rx="12" ry="10" fill="#1f2937" />
        <ellipse cx="33" cy="46" rx="10" ry="8" fill="#93c5fd" opacity="0.75" />
        <ellipse cx="33" cy="46" rx="10" ry="8" fill="none" stroke="#2563eb" strokeWidth="1.5" />
        {/* Right goggle */}
        <ellipse cx="67" cy="46" rx="12" ry="10" fill="#1f2937" />
        <ellipse cx="67" cy="46" rx="10" ry="8" fill="#93c5fd" opacity="0.75" />
        <ellipse cx="67" cy="46" rx="10" ry="8" fill="none" stroke="#2563eb" strokeWidth="1.5" />
        {/* Thick nose bridge */}
        <path d="M43,46 Q50,44 57,46" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Lens highlights */}
        <ellipse cx="28" cy="42" rx="4" ry="2.5" fill="rgba(255,255,255,0.5)" />
        <ellipse cx="62" cy="42" rx="4" ry="2.5" fill="rgba(255,255,255,0.5)" />
      </g>
    ),
  },
  {
    id: 'heart_glasses', name: 'Heart Glasses', emoji: '🩷', tier: 'premium',
    svgPath: (
      <g>
        {/* Left lens — heart shaped */}
        <path d="M34,51 C34,51 25,46 25,41 C25,37.4 27.5,35.5 30,35.5 C31.8,35.5 34,37.2 34,37.2 C34,37.2 36.2,35.5 38,35.5 C40.5,35.5 43,37.4 43,41 C43,46 34,51 34,51Z" fill="#fda4af" opacity="0.88" />
        <path d="M34,51 C34,51 25,46 25,41 C25,37.4 27.5,35.5 30,35.5 C31.8,35.5 34,37.2 34,37.2 C34,37.2 36.2,35.5 38,35.5 C40.5,35.5 43,37.4 43,41 C43,46 34,51 34,51Z" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
        <ellipse cx="30" cy="39" rx="3" ry="2" fill="rgba(255,255,255,0.45)" />
        {/* Right lens — heart shaped */}
        <path d="M66,51 C66,51 57,46 57,41 C57,37.4 59.5,35.5 62,35.5 C63.8,35.5 66,37.2 66,37.2 C66,37.2 68.2,35.5 70,35.5 C72.5,35.5 75,37.4 75,41 C75,46 66,51 66,51Z" fill="#fda4af" opacity="0.88" />
        <path d="M66,51 C66,51 57,46 57,41 C57,37.4 59.5,35.5 62,35.5 C63.8,35.5 66,37.2 66,37.2 C66,37.2 68.2,35.5 70,35.5 C72.5,35.5 75,37.4 75,41 C75,46 66,51 66,51Z" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
        <ellipse cx="62" cy="39" rx="3" ry="2" fill="rgba(255,255,255,0.45)" />
        {/* Bridge + temples */}
        <line x1="43" y1="43" x2="57" y2="43" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="42" x2="15" y2="45" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="75" y1="42" x2="85" y2="45" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'star_glasses', name: 'Star Glasses', emoji: '🌟', tier: 'premium',
    svgPath: (
      <g>
        {/* Left lens — big star */}
        <polygon points="34,35 37,42.5 45,42.5 39,47 41.5,54.5 34,50 26.5,54.5 29,47 23,42.5 31,42.5" fill="#fbbf24" opacity="0.92" />
        <polygon points="34,35 37,42.5 45,42.5 39,47 41.5,54.5 34,50 26.5,54.5 29,47 23,42.5 31,42.5" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
        <ellipse cx="31" cy="40" rx="3.5" ry="2.2" fill="rgba(255,255,255,0.5)" />
        {/* Right lens — big star */}
        <polygon points="66,35 69,42.5 77,42.5 71,47 73.5,54.5 66,50 58.5,54.5 61,47 55,42.5 63,42.5" fill="#fbbf24" opacity="0.92" />
        <polygon points="66,35 69,42.5 77,42.5 71,47 73.5,54.5 66,50 58.5,54.5 61,47 55,42.5 63,42.5" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
        <ellipse cx="63" cy="40" rx="3.5" ry="2.2" fill="rgba(255,255,255,0.5)" />
        {/* Bridge + temples */}
        <line x1="45" y1="44" x2="55" y2="44" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <line x1="23" y1="44" x2="13" y2="47" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="77" y1="44" x2="87" y2="47" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    ),
  },
];

// ─── Badge definitions ────────────────────────────────────────────────────────────

export interface MascotBadge {
  id: string;
  name: string;
  emoji: string;
  tier: 'basic' | 'plus' | 'premium';
  svgPath: React.ReactNode;
}

export const MASCOT_BADGES: MascotBadge[] = [
  {
    id: 'heart_badge', name: 'Heart', emoji: '❤️', tier: 'basic',
    svgPath: (
      <g>
        <circle cx="74" cy="70" r="17" fill="#fda4af" opacity="0.15" />
        <circle cx="74" cy="70" r="13" fill="#fda4af" opacity="0.38" />
        <circle cx="74" cy="70" r="9" fill="white" />
        <circle cx="74" cy="70" r="9" fill="none" stroke="#fca5a5" strokeWidth="1.5" />
        {/* Heart — slightly smaller than before */}
        <path d="M74,77 C74,77 66,72 66,67.5 C66,64.5 68,63 70,63 C71.5,63 74,64.5 74,64.5 C74,64.5 76.5,63 78,63 C80,63 82,64.5 82,67.5 C82,72 74,77 74,77Z" fill="#ef4444" />
      </g>
    ),
  },
  {
    id: 'star_badge', name: 'Star', emoji: '⭐', tier: 'plus',
    svgPath: (
      <g>
        <circle cx="74" cy="70" r="17" fill="#fcd34d" opacity="0.15" />
        <circle cx="74" cy="70" r="13" fill="#fcd34d" opacity="0.38" />
        <circle cx="74" cy="70" r="9" fill="white" />
        <circle cx="74" cy="70" r="9" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
        <polygon points="74,61.5 76.5,67.5 83,67.5 78,71.5 80,78 74,74 68,78 70,71.5 65,67.5 71.5,67.5" fill="#f59e0b" />
      </g>
    ),
  },
  {
    id: 'bolt_badge', name: 'Lightning', emoji: '⚡', tier: 'plus',
    svgPath: (
      <g>
        <circle cx="74" cy="70" r="17" fill="#c7d2fe" opacity="0.15" />
        <circle cx="74" cy="70" r="13" fill="#c7d2fe" opacity="0.38" />
        <circle cx="74" cy="70" r="9" fill="white" />
        <circle cx="74" cy="70" r="9" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
        <polygon points="76,62 69,71 74,71 71,78 81,69 76,69" fill="#6366f1" />
      </g>
    ),
  },
  {
    id: 'flame_badge', name: 'Flame', emoji: '🔥', tier: 'plus',
    svgPath: (
      <g>
        <circle cx="74" cy="70" r="17" fill="#fed7aa" opacity="0.15" />
        <circle cx="74" cy="70" r="13" fill="#fed7aa" opacity="0.38" />
        <circle cx="74" cy="70" r="9" fill="white" />
        <circle cx="74" cy="70" r="9" fill="none" stroke="#fed7aa" strokeWidth="1.5" />
        <path d="M74,62 C74,62 78,65 77,68 C80,65 79,70 79,72 C79,75 76.5,78 74,78 C71.5,78 69,75 69,72 C68,65 71,68 71,68 C70,65 74,62 74,62Z" fill="#f97316" />
        <path d="M74,65 C74,65 76,67 75.5,69 C77,67.5 76.5,70.5 76.5,72 C76.5,74 75.2,75.5 74,75.5 C72.8,75.5 71.5,74 71.5,72 C71,70.5 72.5,69 72.5,69 C72,67 74,65 74,65Z" fill="#fbbf24" />
      </g>
    ),
  },
  {
    id: 'leaf_badge', name: 'Leaf', emoji: '🌿', tier: 'plus',
    svgPath: (
      <g>
        <circle cx="74" cy="70" r="17" fill="#bbf7d0" opacity="0.15" />
        <circle cx="74" cy="70" r="13" fill="#bbf7d0" opacity="0.38" />
        <circle cx="74" cy="70" r="9" fill="white" />
        <circle cx="74" cy="70" r="9" fill="none" stroke="#bbf7d0" strokeWidth="1.5" />
        <path d="M74,62 C74,62 82,66 80,72 C80,75 77,78 74,78 C71,78 68,75 68,72 C66,66 74,62 74,62Z" fill="#22c55e" />
        <line x1="74" y1="62" x2="74" y2="78" stroke="#15803d" strokeWidth="1.2" />
        <line x1="74" y1="68" x2="70" y2="65" stroke="#15803d" strokeWidth="1" strokeLinecap="round" />
        <line x1="74" y1="71" x2="78" y2="68" stroke="#15803d" strokeWidth="1" strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'shield_badge', name: 'Shield', emoji: '🛡️', tier: 'premium',
    svgPath: (
      <g>
        <circle cx="74" cy="70" r="17" fill="#bfdbfe" opacity="0.15" />
        <circle cx="74" cy="70" r="13" fill="#bfdbfe" opacity="0.38" />
        <circle cx="74" cy="70" r="9" fill="white" />
        <circle cx="74" cy="70" r="9" fill="none" stroke="#bfdbfe" strokeWidth="1.5" />
        <path d="M74,62 L79,64.5 L79,69.5 C79,73 76.5,75.5 74,77 C71.5,75.5 69,73 69,69.5 L69,64.5 Z" fill="#3b82f6" />
        <polyline points="71,70 73.5,72.5 78,67" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    ),
  },
];

// ─── Shoes definitions ────────────────────────────────────────────────────────────

export interface MascotShoes {
  id: string;
  name: string;
  emoji: string;
  tier: 'basic' | 'plus' | 'premium';
  svgPath: React.ReactNode;
}

export const MASCOT_SHOES: MascotShoes[] = [
  {
    id: 'sneakers', name: 'Sneakers', emoji: '👟', tier: 'basic',
    svgPath: (
      <g>
        {/* LEFT shoe — toe points LEFT (lower x), heel right */}
        <path d="M45,98 L45,91 Q44,88 39,87 L29,87 Q22,87 19,90 Q18,92 19,96 L19,98 Z" fill="white" stroke="#d1d5db" strokeWidth="1.2" />
        {/* Tongue tab at heel side */}
        <rect x="39" y="87" width="5" height="5" rx="1" fill="#f3f4f6" />
        {/* Toe highlight */}
        <ellipse cx="21" cy="91" rx="3" ry="2" fill="#f9fafb" />
        {/* Sole */}
        <path d="M18,96 L46,96 L46,99 Q46,100 45,100 L19,100 Q18,100 18,99 Z" fill="#9ca3af" />
        {/* Lace lines */}
        <line x1="32" y1="89" x2="38" y2="89" stroke="#d1d5db" strokeWidth="0.8" />
        <line x1="32" y1="91" x2="38" y2="91" stroke="#d1d5db" strokeWidth="0.8" />
        {/* RIGHT shoe — toe points RIGHT (higher x), heel left — mirror */}
        <path d="M55,98 L55,91 Q56,88 61,87 L71,87 Q78,87 81,90 Q82,92 81,96 L81,98 Z" fill="white" stroke="#d1d5db" strokeWidth="1.2" />
        <rect x="56" y="87" width="5" height="5" rx="1" fill="#f3f4f6" />
        <ellipse cx="79" cy="91" rx="3" ry="2" fill="#f9fafb" />
        <path d="M54,96 L82,96 L82,99 Q82,100 81,100 L55,100 Q54,100 54,99 Z" fill="#9ca3af" />
        <line x1="62" y1="89" x2="68" y2="89" stroke="#d1d5db" strokeWidth="0.8" />
        <line x1="62" y1="91" x2="68" y2="91" stroke="#d1d5db" strokeWidth="0.8" />
      </g>
    ),
  },
  {
    id: 'boots', name: 'Boots', emoji: '🥾', tier: 'plus',
    svgPath: (
      <g>
        {/* LEFT boot — shaft on heel-side (right), toe extends LEFT */}
        {/* Shaft */}
        <rect x="38" y="82" width="8" height="18" rx="3" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
        {/* Foot portion extending left from shaft */}
        <path d="M46,95 L46,100 L19,100 L19,95 Q20,91 27,90 Q34,89 38,91 L38,95 Z" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
        {/* Sole */}
        <rect x="18" y="98" width="29" height="3" rx="1.5" fill="#78350f" />
        {/* Shaft lace lines */}
        <line x1="39" y1="85" x2="45" y2="85" stroke="#a16207" strokeWidth="0.8" />
        <line x1="39" y1="88" x2="45" y2="88" stroke="#a16207" strokeWidth="0.8" />
        <line x1="39" y1="91" x2="45" y2="91" stroke="#a16207" strokeWidth="0.8" />
        {/* RIGHT boot — mirror */}
        <rect x="54" y="82" width="8" height="18" rx="3" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
        <path d="M54,95 L54,100 L81,100 L81,95 Q80,91 73,90 Q66,89 62,91 L62,95 Z" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
        <rect x="53" y="98" width="29" height="3" rx="1.5" fill="#78350f" />
        <line x1="55" y1="85" x2="61" y2="85" stroke="#a16207" strokeWidth="0.8" />
        <line x1="55" y1="88" x2="61" y2="88" stroke="#a16207" strokeWidth="0.8" />
        <line x1="55" y1="91" x2="61" y2="91" stroke="#a16207" strokeWidth="0.8" />
      </g>
    ),
  },
  {
    id: 'running_shoes', name: 'Running', emoji: '🏃', tier: 'plus',
    svgPath: (
      <g>
        {/* LEFT — blue, toe LEFT */}
        <path d="M45,98 L45,91 Q44,88 38,87 L28,87 Q21,87 19,90 Q18,92 19,96 L19,98 Z" fill="#3b82f6" stroke="#2563eb" strokeWidth="0.8" />
        {/* Swoosh from toe toward heel */}
        <path d="M22,91 Q31,88.5 42,91" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        {/* Sole */}
        <rect x="18" y="96" width="28" height="3.5" rx="1.5" fill="#1d4ed8" />
        {/* Tongue */}
        <rect x="38" y="87" width="5" height="5" rx="1" fill="#60a5fa" opacity="0.85" />
        {/* RIGHT — red, toe RIGHT */}
        <path d="M55,98 L55,91 Q56,88 62,87 L72,87 Q79,87 81,90 Q82,92 81,96 L81,98 Z" fill="#ef4444" stroke="#dc2626" strokeWidth="0.8" />
        <path d="M78,91 Q69,88.5 58,91" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        <rect x="54" y="96" width="28" height="3.5" rx="1.5" fill="#b91c1c" />
        <rect x="57" y="87" width="5" height="5" rx="1" fill="#f87171" opacity="0.85" />
      </g>
    ),
  },
  {
    id: 'platforms', name: 'Platforms', emoji: '👠', tier: 'premium',
    svgPath: (
      <g>
        {/* LEFT platform — toe LEFT, chunky platform + visible heel block */}
        {/* Upper */}
        <path d="M45,96 L45,88 Q44,85 38,84 L28,84 Q21,84 19,87 Q18,89 20,93 L20,96 Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="0.8" />
        {/* Thick platform sole */}
        <path d="M18,94 L46,94 L46,101 L18,101 Z" fill="#4c1d95" />
        {/* Visible raised heel block (right side of left shoe) */}
        <path d="M41,88 L46,88 L46,101 L41,101 Z" fill="#6d28d9" />
        {/* Sole highlight stripe */}
        <line x1="18" y1="96" x2="46" y2="96" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.4" />
        {/* RIGHT platform — mirror */}
        <path d="M55,96 L55,88 Q56,85 62,84 L72,84 Q79,84 81,87 Q82,89 80,93 L80,96 Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="0.8" />
        <path d="M54,94 L82,94 L82,101 L54,101 Z" fill="#4c1d95" />
        {/* Visible raised heel block (left side of right shoe) */}
        <path d="M54,88 L59,88 L59,101 L54,101 Z" fill="#6d28d9" />
        <line x1="54" y1="96" x2="82" y2="96" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.4" />
      </g>
    ),
  },
];

// ─── Back bling definitions (renders BEFORE body circle — appears behind mascot) ──

export interface MascotBackBling {
  id: string;
  name: string;
  emoji: string;
  tier: 'basic' | 'plus' | 'premium';
  svgPath: React.ReactNode;
}

export const MASCOT_BACK_BLING: MascotBackBling[] = [
  {
    id: 'cape', name: 'Cape', emoji: '🦸', tier: 'basic',
    svgPath: (
      <g>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-2.5,50,47;2.5,50,47;-2.5,50,47" dur="3.8s" repeatCount="indefinite" additive="sum" />
          {/* Main cape body — wide, flows past circle, pointed jagged hem */}
          <path d="M18,47 C12,52 5,62 4,76 C3,90 9,104 15,111 L22,118 L30,107 L38,116 L46,106 L50,113 L54,106 L62,116 L70,107 L78,118 L85,111 C91,104 97,90 96,76 C95,62 88,52 82,47 C65,56 35,56 18,47Z" fill="#dc2626" />
          {/* Inner shadow for depth */}
          <path d="M28,70 C35,74 65,74 72,70 L68,98 Q50,103 32,98 Z" fill="#b91c1c" opacity="0.45" />
          {/* Left edge highlight */}
          <path d="M18,47 C12,52 5,62 4,76 C3,90 9,104 15,111 L22,118" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
          {/* Right edge highlight */}
          <path d="M82,47 C88,52 95,62 96,76 C97,90 91,104 85,111 L78,118" fill="none" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
          {/* Collar */}
          <path d="M20,47 Q50,57 80,47 L82,44 Q50,54 18,44 Z" fill="#b91c1c" />
          <path d="M23,45 Q50,53 77,45" fill="none" stroke="#fca5a5" strokeWidth="0.9" opacity="0.5" />
        </g>
      </g>
    ),
  },
  {
    id: 'angel_wings', name: 'Angel Wings', emoji: '🪽', tier: 'premium',
    svgPath: (
      <g>
        {/* ── LEFT WING — rotates around base (7,54) for flap ── */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0,7,54;-8,7,54;-2,7,54;-10,7,54;-4,7,54;0,7,54" dur="2.6s" repeatCount="indefinite" />
          <ellipse cx="-4" cy="46" rx="30" ry="38" fill="#fef9c3" opacity="0.38" />
          <path d="M7,56 C4,46 -2,34 -12,22 C-8,26 -4,32 0,40 C-4,30 -8,20 -14,12 C-8,18 -2,28 2,38 C0,28 -2,18 -4,10 C2,18 6,30 8,42 Z" fill="#fffde7" stroke="#fde68a" strokeWidth="1.2" />
          <path d="M7,56 C4,48 0,40 -8,32 C-4,36 0,42 4,48 Z" fill="white" stroke="#fde68a" strokeWidth="0.9" />
          <path d="M7,56 C2,52 -4,50 -10,50 C-5,52 0,54 5,55 Z" fill="#fffde7" stroke="#fde68a" strokeWidth="0.8" />
          <path d="M6,54 C0,44 -6,34 -14,22" fill="none" stroke="#fde68a" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <path d="M6,50 C1,42 -4,32 -10,22" fill="none" stroke="#fde68a" strokeWidth="0.7" strokeLinecap="round" opacity="0.65" />
          <path d="M6,46 C2,38 0,28 -2,18" fill="none" stroke="#fde68a" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
          <path d="M6,42 C4,34 4,24 2,16" fill="none" stroke="#fde68a" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
        </g>
        {/* ── RIGHT WING — mirror flap ── */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="0,93,54;8,93,54;2,93,54;10,93,54;4,93,54;0,93,54" dur="2.6s" repeatCount="indefinite" />
          <ellipse cx="104" cy="46" rx="30" ry="38" fill="#fef9c3" opacity="0.38" />
          <path d="M93,56 C96,46 102,34 112,22 C108,26 104,32 100,40 C104,30 108,20 114,12 C108,18 102,28 98,38 C100,28 102,18 104,10 C98,18 94,30 92,42 Z" fill="#fffde7" stroke="#fde68a" strokeWidth="1.2" />
          <path d="M93,56 C96,48 100,40 108,32 C104,36 100,42 96,48 Z" fill="white" stroke="#fde68a" strokeWidth="0.9" />
          <path d="M93,56 C98,52 104,50 110,50 C105,52 100,54 95,55 Z" fill="#fffde7" stroke="#fde68a" strokeWidth="0.8" />
          <path d="M94,54 C100,44 106,34 114,22" fill="none" stroke="#fde68a" strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <path d="M94,50 C99,42 104,32 110,22" fill="none" stroke="#fde68a" strokeWidth="0.7" strokeLinecap="round" opacity="0.65" />
          <path d="M94,46 C98,38 100,28 102,18" fill="none" stroke="#fde68a" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
          <path d="M94,42 C96,34 96,24 98,16" fill="none" stroke="#fde68a" strokeWidth="0.6" strokeLinecap="round" opacity="0.5" />
        </g>
      </g>
    ),
  },
  {
    id: 'jetpack', name: 'Jetpack', emoji: '🚀', tier: 'premium',
    svgPath: (
      <g>
        {/* Whole jetpack jiggles up/down as if firing */}
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,-0.5;0,-2.5;0,-1;0,0" dur="0.45s" repeatCount="indefinite" />
        {/* ── LEFT PACK ── */}
        <rect x="3" y="56" width="16" height="30" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <rect x="5" y="59" width="12" height="22" rx="3" fill="#1e293b" />
        <rect x="5" y="60" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <rect x="5" y="63" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <rect x="5" y="66" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <rect x="5" y="69" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <path d="M7,86 Q11,84 15,86 L15,88 Q11,90 7,88 Z" fill="#334155" stroke="#475569" strokeWidth="0.8" />
        {/* ── RIGHT PACK ── */}
        <rect x="81" y="56" width="16" height="30" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <rect x="83" y="59" width="12" height="22" rx="3" fill="#1e293b" />
        <rect x="83" y="60" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <rect x="83" y="63" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <rect x="83" y="66" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <rect x="83" y="69" width="12" height="1.8" rx="0.9" fill="#475569" opacity="0.8" />
        <path d="M85,86 Q89,84 93,86 L93,88 Q89,90 85,88 Z" fill="#334155" stroke="#475569" strokeWidth="0.8" />
        {/* ── LEFT FLAME — animated flicker ── */}
        <ellipse cx="11" cy="98" rx="13" ry="18" fill="#f97316">
          <animate attributeName="opacity" values="0.2;0.38;0.15;0.32;0.2" dur="0.38s" repeatCount="indefinite" />
          <animate attributeName="ry" values="18;23;15;21;18" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
        <path d="M5,108 Q3,98 6,90 Q8,85 11,88 Q14,85 16,90 Q19,98 17,108 Q14,111 11,110 Q8,111 5,108Z" fill="#f97316">
          <animate attributeName="opacity" values="1;0.85;1;0.9;1" dur="0.3s" repeatCount="indefinite" />
        </path>
        <path d="M7,106 Q6,97 8,91 Q9.5,88 11,90 Q12.5,88 14,91 Q16,97 15,106 Q13,109 11,108 Q9,109 7,106Z" fill="#fbbf24">
          <animate attributeName="opacity" values="1;0.8;1;0.88;1" dur="0.28s" repeatCount="indefinite" />
        </path>
        <path d="M9,103 Q8.5,96 10,92 Q10.5,90.5 11,92 Q11.5,90.5 12,92 Q13.5,96 13,103 Q12,106 11,105 Q10,106 9,103Z" fill="white">
          <animate attributeName="opacity" values="0.92;0.65;0.95;0.7;0.92" dur="0.25s" repeatCount="indefinite" />
        </path>
        {/* ── RIGHT FLAME — animated flicker (offset timing) ── */}
        <ellipse cx="89" cy="98" rx="13" ry="18" fill="#f97316">
          <animate attributeName="opacity" values="0.15;0.32;0.2;0.38;0.15" dur="0.38s" repeatCount="indefinite" />
          <animate attributeName="ry" values="15;21;18;23;15" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
        <path d="M83,108 Q81,98 84,90 Q86,85 89,88 Q92,85 94,90 Q97,98 95,108 Q92,111 89,110 Q86,111 83,108Z" fill="#f97316">
          <animate attributeName="opacity" values="0.9;1;0.85;1;0.9" dur="0.3s" repeatCount="indefinite" />
        </path>
        <path d="M85,106 Q84,97 86,91 Q87.5,88 89,90 Q90.5,88 92,91 Q94,97 93,106 Q91,109 89,108 Q87,109 85,106Z" fill="#fbbf24">
          <animate attributeName="opacity" values="0.88;1;0.8;1;0.88" dur="0.28s" repeatCount="indefinite" />
        </path>
        <path d="M87,103 Q86.5,96 88,92 Q88.5,90.5 89,92 Q89.5,90.5 90,92 Q91.5,96 91,103 Q90,106 89,105 Q88,106 87,103Z" fill="white">
          <animate attributeName="opacity" values="0.7;0.92;0.65;0.95;0.7" dur="0.25s" repeatCount="indefinite" />
        </path>
      </g>
    ),
  },
];

// ─── Mini buddy definitions ────────────────────────────────────────────────────────

export interface MascotMiniBuddy {
  id: string;
  name: string;
  emoji: string;
  tier: 'basic' | 'plus' | 'premium';
  svgPath: React.ReactNode;
}

export const MASCOT_MINI_BUDDIES: MascotMiniBuddy[] = [
  {
    id: 'heart_pal', name: 'Heart Pal', emoji: '💗', tier: 'basic',
    svgPath: (
      <g>
        {/* Pink circular body */}
        <circle cx="20" cy="76" r="10" fill="#ffc0cb" stroke="#f43f5e" strokeWidth="1.5" />
        {/* Tiny heart on cheek */}
        <path d="M24.5,72 C24.5,72 23,70.8 23,70 C23,69.4 23.5,69 24,69 C24.2,69 24.5,69.3 24.5,69.3 C24.5,69.3 24.8,69 25,69 C25.5,69 26,69.4 26,70 C26,70.8 24.5,72 24.5,72Z" fill="#f43f5e" />
        {/* Dot eyes */}
        <circle cx="17" cy="74.5" r="1.4" fill="#1a1a2e" />
        <circle cx="23" cy="74.5" r="1.4" fill="#1a1a2e" />
        {/* Eye shines */}
        <circle cx="17.6" cy="74" r="0.55" fill="white" opacity="0.9" />
        <circle cx="23.6" cy="74" r="0.55" fill="white" opacity="0.9" />
        {/* Smile */}
        <path d="M17,78 Q20,81 23,78" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'star_pal', name: 'Star Pal', emoji: '⭐', tier: 'plus',
    svgPath: (
      <g>
        {/* Yellow circular body */}
        <circle cx="20" cy="76" r="10" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Small star on cheek */}
        <polygon points="25,70.5 25.7,72.5 27.8,72.5 26.2,73.7 26.8,75.7 25,74.5 23.2,75.7 23.8,73.7 22.2,72.5 24.3,72.5" fill="#f59e0b" />
        {/* Dot eyes */}
        <circle cx="17" cy="74.5" r="1.4" fill="#1a1a2e" />
        <circle cx="23" cy="74.5" r="1.4" fill="#1a1a2e" />
        <circle cx="17.6" cy="74" r="0.55" fill="white" opacity="0.9" />
        <circle cx="23.6" cy="74" r="0.55" fill="white" opacity="0.9" />
        {/* Wide happy smile */}
        <path d="M16.5,78 Q20,82 23.5,78" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    id: 'sprout_pal', name: 'Sprout', emoji: '🌱', tier: 'premium',
    svgPath: (
      <g>
        {/* Green circular body */}
        <circle cx="20" cy="76" r="10" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
        {/* Leaf "antenna" growing from top — like leaf badge */}
        <line x1="20" y1="66" x2="20" y2="70" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20,68.5 C20,68.5 17,65.5 14.5,66.5 C17,68 20,68.5 20,68.5Z" fill="#22c55e" />
        <path d="M20,67 C20,67 23,64 25.5,65 C23,66.5 20,67 20,67Z" fill="#22c55e" />
        {/* Dot eyes */}
        <circle cx="17" cy="74.5" r="1.4" fill="#1a1a2e" />
        <circle cx="23" cy="74.5" r="1.4" fill="#1a1a2e" />
        <circle cx="17.6" cy="74" r="0.55" fill="white" opacity="0.9" />
        <circle cx="23.6" cy="74" r="0.55" fill="white" opacity="0.9" />
        {/* Gentle smile */}
        <path d="M17.5,78 Q20,80.5 22.5,78" stroke="#1a1a2e" strokeWidth="1" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
];

// ─── Energy configuration ───────────────────────────────────────────────────────

export const ENERGY_CONFIG = {
  low: {
    color:          '#3b82f6',
    glowColor:      'rgba(59,130,246,0.22)',
    glowBlur:       8,
    glowInset:      -8,
    bounceHeight:   [7, 12] as [number, number],
    bouncePeriod:   [5000, 8000] as [number, number],
    horizontalRange: 8,
    squashImpact:   0.80,
    squashPeak:     1.10,
    particleCount:  0,
  },
  medium: {
    color:          '#eab308',
    glowColor:      'rgba(234,179,8,0.22)',
    glowBlur:       12,
    glowInset:      -12,
    bounceHeight:   [14, 22] as [number, number],
    bouncePeriod:   [3000, 5500] as [number, number],
    horizontalRange: 14,
    squashImpact:   0.74,
    squashPeak:     1.12,
    particleCount:  3,
  },
  high: {
    color:          '#22c55e',
    glowColor:      'rgba(34,197,94,0.30)',
    glowBlur:       18,
    glowInset:      -18,
    bounceHeight:   [22, 32] as [number, number],
    bouncePeriod:   [1600, 3000] as [number, number],
    horizontalRange: 22,
    squashImpact:   0.68,
    squashPeak:     1.16,
    particleCount:  6,
  },
} as const;

// ─── Energy message pools ────────────────────────────────────────────────────────

function getIdleMessages(energy: 'low' | 'medium' | 'high', name: string): string[] {
  const n = name || 'Friend';
  const shared = [`Hey ${n}! 😊`, `You're amazing, ${n}!`];

  if (energy === 'low') return [
    "Let's take it slow today.",
    "Any progress is good progress.",
    "Rest is part of the plan too.",
    "Small steps still move forward.",
    `No rush today, ${n}.`,
    "Easy does it. You've got this.",
    ...shared,
  ];

  if (energy === 'high') return [
    "I'm amped up! Let's do this!",
    "We are ON FIRE today! 🔥",
    `${n} is absolutely crushing it!`,
    "Full send! No holding back!",
    "Maximum effort, maximum results!",
    "Let's GO! Nothing can stop us!",
    ...shared,
  ];

  return [
    "You've got this! 💪",
    "One step at a time!",
    "Proud of you!",
    "Keep going!",
    "You're doing great!",
    `${n} is crushing it! 🔥`,
    ...shared,
  ];
}

// ─── Particle system ─────────────────────────────────────────────────────────────

interface Particle { id: number; x: number; y: number; vx: number; vy: number; life: number; size: number }

function Particles({ energy, color }: { energy: 'low' | 'medium' | 'high'; color: string }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef<number>();
  const nextId = useRef(0);
  const cfg = ENERGY_CONFIG[energy];

  useEffect(() => {
    if (cfg.particleCount === 0) { setParticles([]); return; }

    let last = performance.now();
    let timeSinceSpawn = 0;
    const spawnRate = energy === 'high' ? 280 : 550;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); // cap dt to avoid jumps
      last = now;
      timeSinceSpawn += dt;

      setParticles(prev => {
        let next = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * dt * 0.045,
            y: p.y + p.vy * dt * 0.045,
            vy: p.vy + 0.012 * dt, // subtle gravity on particles
            life: p.life - dt * (energy === 'high' ? 0.0022 : 0.0015),
          }))
          .filter(p => p.life > 0);

        if (timeSinceSpawn > spawnRate && next.length < cfg.particleCount * 2) {
          timeSinceSpawn = 0;
          const angle = Math.random() * Math.PI * 2;
          const speed = energy === 'high' ? 1.2 + Math.random() * 1.8 : 0.6 + Math.random() * 0.9;
          next = [...next, {
            id: nextId.current++,
            x: (Math.random() - 0.5) * 24,
            y: (Math.random() - 0.5) * 24,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (energy === 'high' ? 0.8 : 0.4),
            life: 0.75 + Math.random() * 0.25,
            size: energy === 'high' ? 3 + Math.random() * 3.5 : 2 + Math.random() * 2.5,
          }];
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [energy]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: color,
            opacity: p.life * 0.85,
            transform: `translate(${p.x}px, ${p.y}px)`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}

// ─── Shadow ellipse under mascot ────────────────────────────────────────────────

function GroundShadow({ y, x, size }: { y: number; x: number; size: number }) {
  // factor = 1 at ground (y=0), → 0 at peak
  const factor  = Math.max(0, 1 - Math.abs(y) / 60);
  const width   = (size * 0.55) * (0.4 + factor * 0.6);
  const blur    = 3 + (1 - factor) * 5;
  const opacity = factor * 0.28;
  return (
    <div
      style={{
        width,
        height:       8,
        borderRadius: '50%',
        background:   'rgba(0,0,0,0.55)',
        filter:       `blur(${blur}px)`,
        opacity,
        transform:    `translateX(${x * 0.85}px)`,
        transition:   'none',
        flexShrink:   0,
      }}
    />
  );
}

// ─── Main Mascot ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export default function Mascot({
  message,
  mood = 'happy',
  className = '',
  persistent = false,
  currentEnergy = 'medium',
  userName = '',
  size = 96,
  suppressBubble = false,
  hat,
  eyewear,
  badge,
  shoes,
  backBling,
  miniBuddy,
}: MascotProps) {
  const bodyControls   = useAnimationControls(); // bounce physics
  const wrapperControls = useAnimationControls(); // energy zoom

  const mountedRef    = useRef(false);
  const loopActive    = useRef(false);
  const energyRef     = useRef(currentEnergy);
  const prevEnergyRef = useRef<string | null>(null);
  const backBlingRef  = useRef(backBling);

  const [isTalking,      setIsTalking]      = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message ?? '');
  const [mascotColor,    setMascotColor]    = useState(ENERGY_CONFIG[currentEnergy].color);
  // Track position so the ground shadow can react
  const [bodyY, setBodyY] = useState(0);
  const [bodyX, setBodyX] = useState(0);

  const cfg = ENERGY_CONFIG[currentEnergy];

  // ── Track mount state so async loop doesn't call controls after unmount ─────
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Keep backBlingRef in sync so the async loop reads the latest value
  useEffect(() => { backBlingRef.current = backBling; }, [backBling]);

  // ── Handle incoming message prop ────────────────────────────────────────────
  const idleRef = useRef<NodeJS.Timeout>();
  const msgRef  = useRef<NodeJS.Timeout>();

  const startIdleMode = useCallback(() => {
    const show = () => {
      const msgs = getIdleMessages(energyRef.current, userName);
      setCurrentMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      setIsTalking(true);
      setTimeout(() => setIsTalking(false), 1800);
      idleRef.current = setTimeout(show, 9000 + Math.random() * 5000);
    };
    clearTimeout(idleRef.current);
    show();
  }, [userName]);

  useEffect(() => {
    if (!message) return;
    clearTimeout(msgRef.current);
    clearTimeout(idleRef.current);
    setCurrentMessage(message);
    setIsTalking(true);
    const t = setTimeout(() => setIsTalking(false), 2000);
    if (!persistent) {
      msgRef.current = setTimeout(() => startIdleMode(), 5000);
    }
    return () => clearTimeout(t);
  }, [message, persistent, startIdleMode]);

  // ── Energy change: zoom + color transition ──────────────────────────────────
  useEffect(() => {
    const isFirstRender = prevEnergyRef.current === null;
    prevEnergyRef.current = currentEnergy;
    energyRef.current = currentEnergy;
    setMascotColor(ENERGY_CONFIG[currentEnergy].color);

    if (!isFirstRender && mountedRef.current) {
      // Subtle pulse on energy change (full-screen overlay in PlanView handles the big reveal)
      wrapperControls.start({
        scale: [1, 1.12, 1],
        transition: { times: [0, 0.35, 1], duration: 0.55, ease: ['easeOut', 'easeInOut'] },
      });
    }
  }, [currentEnergy, wrapperControls]);

  // Bounce / float loop
  useEffect(() => {
    loopActive.current = true;
    energyRef.current  = currentEnergy;

    const loop = async () => {
      const initDelay = currentEnergy === 'high' ? 400 : currentEnergy === 'low' ? 1800 : 1000;
      await sleep(initDelay);

      while (loopActive.current) {
        const c = ENERGY_CONFIG[energyRef.current];

        // ── Float mode when any back bling is equipped ───────────────────────
        if (backBlingRef.current) {
          const floatY = -(8 + Math.random() * 14);
          const floatX = (Math.random() - 0.5) * c.horizontalRange * 3.2;
          if (!mountedRef.current) break;
          await bodyControls.start({
            y: floatY, x: floatX, scaleY: 1, scaleX: 1,
            transition: { duration: 1.6 + Math.random() * 1.4, ease: 'easeInOut' },
          });
          if (!loopActive.current || !mountedRef.current) break;
          setBodyY(floatY);
          setBodyX(floatX);
          await sleep(300 + Math.random() * 500);
          continue;
        }

        const jumpH   = c.bounceHeight[0] + Math.random() * (c.bounceHeight[1]  - c.bounceHeight[0]);
        const targetX = (Math.random() - 0.5) * c.horizontalRange * 2;

        // 1. Pre-squash (anticipation)
        if (!mountedRef.current) break;
        bodyControls.start({
          scaleY: c.squashImpact,
          scaleX: 1 / c.squashImpact,
          transition: { duration: 0.09, ease: 'easeOut' },
        });
        await sleep(90);
        if (!loopActive.current || !mountedRef.current) break;

        // 2. Rise to peak — ease-out (decelerating like real projectile)
        await bodyControls.start({
          y:      -jumpH,
          x:       targetX,
          scaleY:  c.squashPeak,
          scaleX:  1 / c.squashPeak,
          transition: { duration: 0.33, ease: [0.22, 1, 0.36, 1] },
        });
        if (!loopActive.current || !mountedRef.current) break;
        setBodyY(-jumpH);
        setBodyX(targetX);

        // Brief peak hang-time for high energy
        if (energyRef.current === 'high') await sleep(40);

        // 3. Fall — ease-in (accelerating, gravity)
        if (!mountedRef.current) break;
        await bodyControls.start({
          y:      0,
          scaleY:  c.squashImpact,
          scaleX:  1 / c.squashImpact,
          transition: { duration: 0.28, ease: [0.55, 0, 1, 0.5] },
        });
        if (!loopActive.current || !mountedRef.current) break;
        setBodyY(0);

        // 4. Settle — spring overshoot gives rubber-ball feel
        if (!mountedRef.current) break;
        await bodyControls.start({
          scaleY: 1,
          scaleX: 1,
          transition: { type: 'spring', stiffness: 420, damping: 14 },
        });
        if (!loopActive.current || !mountedRef.current) break;

        // 5. Rest between bounces
        const period = c.bouncePeriod[0] + Math.random() * (c.bouncePeriod[1] - c.bouncePeriod[0]);
        const restTime = Math.max(300, period - 750); // subtract animation time
        await sleep(restTime);
      }
    };

    loop();
    if (!message) startIdleMode();

    return () => {
      loopActive.current = false;
      clearTimeout(idleRef.current);
      clearTimeout(msgRef.current);
    };
  }, [currentEnergy, bodyControls, message, startIdleMode, backBling]);

  // ── Derived visuals ─────────────────────────────────────────────────────────
  const glowStyle: React.CSSProperties = {
    position:     'absolute',
    inset:         cfg.glowInset,
    borderRadius: '50%',
    background:    cfg.glowColor,
    filter:       `blur(${cfg.glowBlur}px)`,
    transition:   'background 0.6s ease, inset 0.6s ease, filter 0.6s ease',
    pointerEvents: 'none',
  };

  return (
    <div
      className={`flex flex-col items-center gap-0 ${className}`}
      style={{ userSelect: 'none' }}
    >
      {/* Outer wrapper: zoom only applies to the body, not the shadow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Zoom wrapper for energy-change animation */}
        <motion.div
          animate={wrapperControls}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Main mascot container */}
          <div
            style={{
              position: 'relative',
              width:  size + 40,
              height: size + 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Particles */}
            <Particles energy={currentEnergy} color={mascotColor} />

            {/* Physics body */}
            <motion.div
              animate={bodyControls}
              style={{ position: 'relative', originX: '50%', originY: '100%' }}
            >
              {/* Aura glow */}
              <div style={glowStyle} />

              {/* SVG face */}
              <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                style={{ position: 'relative', zIndex: 1, overflow: 'visible', display: 'block' }}
              >
                {/* Back bling — rendered first so it appears behind the body */}
                {backBling && MASCOT_BACK_BLING.find(b => b.id === backBling)?.svgPath}

                {/* Body circle */}
                <circle
                  cx="50" cy="50" r="44"
                  fill={mascotColor}
                  style={{ transition: 'fill 0.55s ease' }}
                />
                {/* Shine highlight */}
                <ellipse cx="35" cy="28" rx="13" ry="9" fill="rgba(255,255,255,0.28)" />
                <ellipse cx="32" cy="26" rx="5"  ry="3" fill="rgba(255,255,255,0.18)" />

                {/* Eye whites */}
                <ellipse cx="34" cy="44" rx="5.5" ry="6.5" fill="white" />
                <ellipse cx="66" cy="44" rx="5.5" ry="6.5" fill="white" />
                {/* Pupils — thinking: shifted to upper-right corner */}
                {mood === 'thinking' ? (
                  <>
                    <circle cx="38" cy="42" r="3.8" fill="#1a1a2e" />
                    <circle cx="70" cy="42" r="3.8" fill="#1a1a2e" />
                    <circle cx="40" cy="40" r="1.4" fill="white" opacity="0.9" />
                    <circle cx="72" cy="40" r="1.4" fill="white" opacity="0.9" />
                  </>
                ) : (
                  <>
                    <circle cx="35.5" cy="45.5" r="3.8" fill="#1a1a2e" />
                    <circle cx="67.5" cy="45.5" r="3.8" fill="#1a1a2e" />
                    <circle cx="37.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
                    <circle cx="69.5" cy="43.5" r="1.4" fill="white" opacity="0.9" />
                  </>
                )}

                {/* Mouth */}
                {isTalking ? (
                  <ellipse cx="50" cy="62" rx="9" ry="7.5" fill="#1a1a2e" />
                ) : mood === 'thinking' ? (
                  <ellipse cx="50" cy="63" rx="5.5" ry="5" fill="#1a1a2e" />
                ) : mood === 'excited' ? (
                  <path d="M 37 57 Q 50 70 63 57"
                    stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                ) : (
                  <path d="M 38 58 Q 50 67 62 58"
                    stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                )}

                {/* Cheeks when excited */}
                {(mood === 'excited' || currentEnergy === 'high') && (
                  <>
                    <ellipse cx="25" cy="56" rx="7" ry="4.5" fill="rgba(255,150,150,0.35)" />
                    <ellipse cx="75" cy="56" rx="7" ry="4.5" fill="rgba(255,150,150,0.35)" />
                  </>
                )}

                {/* Hat layer removed */}
                {/* Eyewear layer */}
                {eyewear && MASCOT_EYEWEAR.find(e => e.id === eyewear)?.svgPath}
                {/* Badge layer */}
                {badge && MASCOT_BADGES.find(b => b.id === badge)?.svgPath}
                {/* Shoes layer */}
                {shoes && MASCOT_SHOES.find(s => s.id === shoes)?.svgPath}
                {/* Mini buddy layer — bounces independently on left side */}
                {miniBuddy && (
                  <motion.g
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {MASCOT_MINI_BUDDIES.find(m => m.id === miniBuddy)?.svgPath}
                  </motion.g>
                )}
              </svg>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Speech bubble — hidden when suppressBubble is true (e.g. tutorial overlay) */}
      <AnimatePresence mode="wait">
        {!suppressBubble && currentMessage && (
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
            style={{
              position: 'relative',
              marginTop: 10,
              background: 'white',
              borderRadius: 18,
              padding: '9px 16px',
              boxShadow: '0 3px 14px rgba(0,0,0,0.11)',
              maxWidth: 230,
              textAlign: 'center',
            }}
          >
            {/* Arrow */}
            <div style={{
              position: 'absolute', top: -9, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '9px solid white',
            }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.4, margin: 0 }}>
              {currentMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
