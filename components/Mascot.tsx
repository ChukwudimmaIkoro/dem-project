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
  size?: number; // SVG rendered size in px (default 96)
  suppressBubble?: boolean; // hide speech bubble entirely (used in tutorial overlay)
  hat?: string; // hat item ID from MASCOT_HATS
}

// ─── Hat definitions ─────────────────────────────────────────────────────────────

export interface MascotHat {
  id: string;
  name: string;
  emoji: string;
  svgPath: React.ReactNode;
}

export const MASCOT_HATS: MascotHat[] = [
  {
    id: 'party',
    name: 'Party Hat',
    emoji: '🎉',
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
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
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
    id: 'beanie',
    name: 'Beanie',
    emoji: '🧢',
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
    id: 'tophat',
    name: 'Top Hat',
    emoji: '🎩',
    svgPath: (
      <g>
        <rect x="34" y="12" width="32" height="26" rx="3" fill="#1e293b" />
        <rect x="26" y="36" width="48" height="6" rx="3" fill="#334155" />
        <rect x="38" y="14" width="24" height="4" rx="1" fill="#64748b" opacity="0.4" />
      </g>
    ),
  },
  {
    id: 'bow',
    name: 'Bow',
    emoji: '🎀',
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
}: MascotProps) {
  const bodyControls   = useAnimationControls(); // bounce physics
  const wrapperControls = useAnimationControls(); // energy zoom

  const mountedRef    = useRef(false);
  const loopActive    = useRef(false);
  const energyRef     = useRef(currentEnergy);
  const prevEnergyRef = useRef<string | null>(null);

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

  // Bounce loop
  useEffect(() => {
    loopActive.current = true;
    energyRef.current  = currentEnergy;

    const loop = async () => {
      // Stagger initial launch based on energy
      const initDelay = currentEnergy === 'high' ? 400 : currentEnergy === 'low' ? 1800 : 1000;
      await sleep(initDelay);

      while (loopActive.current) {
        const c = ENERGY_CONFIG[energyRef.current];
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
  }, [currentEnergy, bodyControls, message, startIdleMode]);

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

                {/* Hat layer */}
                {hat && MASCOT_HATS.find(h => h.id === hat)?.svgPath}
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
