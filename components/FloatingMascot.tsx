'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENERGY_CONFIG } from './Mascot';
import type { EnergyLevel } from '@/types';

interface FloatingMascotProps {
  energy?: EnergyLevel;
  userName?: string;
  firstVisitMessage: string;    // shown exactly once, on very first tap
  idleMessages?: string[];      // subsequent taps cycle through these
}

const DEFAULT_IDLE: (name: string) => string[] = (n) => [
  `Hey ${n}! You're doing great!`,
  `${n}, small steps still move forward.`,
  'Tap me anytime for a boost!',
  'Every day you show up is a win.',
  "You've got this, for real!",
  `Proud of you, ${n}!`,
  'Keep going. It adds up.',
];

export default function FloatingMascot({
  energy = 'medium',
  userName = 'friend',
  firstVisitMessage,
  idleMessages,
}: FloatingMascotProps) {
  const [isTalking,    setIsTalking]    = useState(false);
  const [message,      setMessage]      = useState('');
  const hasSpokenRef = useRef(false);

  const messages = idleMessages ?? DEFAULT_IDLE(userName);
  const color    = ENERGY_CONFIG[energy].color;

  const handleTap = () => {
    if (isTalking) { setIsTalking(false); return; }

    let msg: string;
    if (!hasSpokenRef.current) {
      msg = firstVisitMessage;
      hasSpokenRef.current = true;
    } else {
      msg = messages[Math.floor(Math.random() * messages.length)];
    }
    setMessage(msg);
    setIsTalking(true);
    setTimeout(() => setIsTalking(false), 3400);
  };

  return (
    <>
      {/* Dim backdrop while talking */}
      <AnimatePresence>
        {isTalking && (
          <motion.div
            className="fixed inset-0 z-[45] pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.28)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        )}
      </AnimatePresence>

      {/* Widget — positioned just inside the right edge of the content column */}
      <div
        className="fixed z-[46] flex flex-col items-end gap-2"
        style={{
          bottom: '6rem',
          right: 'max(1rem, calc((100vw - 28rem) / 2 + 1rem))',
        }}
      >
        {/* Speech bubble */}
        <AnimatePresence>
          {isTalking && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
              className="relative bg-white rounded-2xl px-4 py-3 shadow-xl"
              style={{
                maxWidth: 200,
                border: `2px solid ${color}33`,
              }}
            >
              <p className="text-xs font-semibold text-gray-800 leading-relaxed">{message}</p>
              {/* Arrow pointing down-right */}
              <div style={{
                position: 'absolute', bottom: -9, right: 20,
                width: 0, height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '9px solid white',
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circle button with subtle squash/stretch */}
        <motion.button
          onClick={handleTap}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: color, border: '3px solid white' }}
          // Idle breathing — very subtle
          animate={isTalking
            ? { scaleX: [1, 1.06, 0.96, 1.03, 1], scaleY: [1, 0.95, 1.05, 0.98, 1] }
            : { scaleX: [1, 1.02, 1, 0.99, 1],    scaleY: [1, 0.99, 1, 1.01, 1]    }
          }
          transition={isTalking
            ? { repeat: Infinity, duration: 0.55, ease: 'easeInOut' }
            : { repeat: Infinity, duration: 3.5,  ease: 'easeInOut', repeatDelay: 1.2 }
          }
          whileTap={{ scale: 0.88 }}
        >
          {/* Mini mascot face */}
          <svg width={34} height={34} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="44" fill="rgba(255,255,255,0.18)" />
            {/* Eye whites */}
            <ellipse cx="34" cy="44" rx="5.5" ry="6.5" fill="white" />
            <ellipse cx="66" cy="44" rx="5.5" ry="6.5" fill="white" />
            {/* Pupils */}
            <circle cx="35.5" cy="45.5" r="3.8" fill="#1a1a2e" />
            <circle cx="67.5" cy="45.5" r="3.8" fill="#1a1a2e" />
            {/* Eye shines */}
            <circle cx="37.5" cy="43.5" r="1.2" fill="white" opacity="0.9" />
            <circle cx="69.5" cy="43.5" r="1.2" fill="white" opacity="0.9" />
            {/* Mouth — open when talking */}
            {isTalking ? (
              <ellipse cx="50" cy="63" rx="8" ry="6.5" fill="#1a1a2e" />
            ) : (
              <path d="M 38 58 Q 50 67 62 58" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </svg>
        </motion.button>
      </div>
    </>
  );
}
