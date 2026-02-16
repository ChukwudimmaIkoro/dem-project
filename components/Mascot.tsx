'use client';

import { useEffect, useState, useRef } from 'react';

interface MascotProps {
  message?: string;
  mood?: 'happy' | 'excited' | 'calm' | 'encouraging';
  className?: string;
  persistent?: boolean;
  currentEnergy?: 'low' | 'medium' | 'high';
  userName?: string;
  dayNumber?: number;
  completedTasks?: string[];
  streak?: number;
  pillar?: 'diet' | 'exercise' | 'mentality';
}

// ─── Energy configs ────────────────────────────────────────────────────────────

const ENERGY_CONFIG = {
  low: {
    color: '#3b82f6',
    bounceHeight: [6, 10],
    bouncePeriod: [5000, 8000],
    horizontalRange: 6,
    squashMax: 1.06,
    squashImpact: 0.82,
    particleCount: 0,
    glowColor: 'rgba(59,130,246,0.25)',
    glowSize: 6,   // px blur radius of aura
    glowInset: -6, // how far aura extends beyond body
  },
  medium: {
    color: '#eab308',
    bounceHeight: [12, 20],
    bouncePeriod: [3000, 5500],
    horizontalRange: 12,
    squashMax: 1.12,
    squashImpact: 0.75,
    particleCount: 3,
    glowColor: 'rgba(234,179,8,0.25)',
    glowSize: 10,
    glowInset: -10,
  },
  high: {
    color: '#22c55e',
    bounceHeight: [20, 30],
    bouncePeriod: [1800, 3200],
    horizontalRange: 20,
    squashMax: 1.18,
    squashImpact: 0.68,
    particleCount: 6,
    glowColor: 'rgba(34,197,94,0.35)',
    glowSize: 18,
    glowInset: -18,
  },
};

// ─── Energy-specific message pools ────────────────────────────────────────────

function getIdleMessages(energy: 'low' | 'medium' | 'high', name: string) {
  const n = name || 'Friend';
  const shared = [
    `How's it going, ${n}? 😊`,
    `You're amazing, ${n}! ✨`,
  ];
  if (energy === 'low') {
    return [
      "Let's take it slow today.",
      "Any progress is good progress.",
      "Rest is part of the plan too.",
      "Small steps still move forward.",
      `No rush today, ${n}.`,
      "Easy does it. You've got this.",
      ...shared,
    ];
  }
  if (energy === 'high') {
    return [
      "I'm amped up! Let's do this!",
      "We are ON FIRE today! 🔥",
      `${n} is absolutely crushing it!`,
      "Full send! No holding back!",
      "Maximum effort, maximum results!",
      "Let's GO! Nothing can stop us!",
      ...shared,
    ];
  }
  // medium
  return [
    "You've got this! 💪",
    "One step at a time! 🌟",
    "Proud of you! ⭐",
    "Keep going! 🚀",
    "You're doing great! 🎉",
    `${n}, ${n}... that's a fun thing to say! 😄`,
    `${n} is crushing it! 🔥`,
    ...shared,
  ];
}

// ─── Particle component ────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;   // 0–1
  size: number;
  color: string;
}

function Particles({ energy, mascotColor }: { energy: 'low' | 'medium' | 'high'; mascotColor: string }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const rafRef = useRef<number>();
  const nextId = useRef(0);
  const cfg = ENERGY_CONFIG[energy];

  useEffect(() => {
    if (cfg.particleCount === 0) { setParticles([]); return; }

    let last = performance.now();
    const spawnRate = energy === 'high' ? 300 : 600; // ms between spawns
    let timeSinceSpawn = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      timeSinceSpawn += dt;

      setParticles(prev => {
        let next = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * dt * 0.05,
            y: p.y + p.vy * dt * 0.05,
            life: p.life - dt * (energy === 'high' ? 0.0025 : 0.0018),
          }))
          .filter(p => p.life > 0);

        if (timeSinceSpawn > spawnRate && next.length < cfg.particleCount * 2) {
          timeSinceSpawn = 0;
          const angle = Math.random() * Math.PI * 2;
          const speed = energy === 'high' ? 1.5 + Math.random() * 2 : 0.8 + Math.random();
          next = [...next, {
            id: nextId.current++,
            x: (Math.random() - 0.5) * 30,
            y: (Math.random() - 0.5) * 30,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (energy === 'high' ? 1 : 0.5),
            life: 0.8 + Math.random() * 0.2,
            size: energy === 'high' ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
            color: mascotColor,
          }];
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [energy, mascotColor]);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            opacity: p.life * (energy === 'high' ? 0.9 : 0.6),
            transform: `translate(${p.x}px, ${p.y}px)`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Mascot ───────────────────────────────────────────────────────────────

export default function Mascot({
  message, mood = 'happy', className = '',
  persistent = false, currentEnergy = 'medium', userName,
}: MascotProps) {
  const [isTalking, setIsTalking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message || '');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [squash, setSquash] = useState(1);
  const [bouncePhase, setBouncePhase] = useState<'rest'|'launch'|'rise'|'peak'|'fall'|'impact'>('rest');
  const messageTimerRef = useRef<NodeJS.Timeout>();
  const bounceTimerRef = useRef<NodeJS.Timeout>();
  const idleTimerRef = useRef<NodeJS.Timeout>();
  // Track energy so we restart bounce timing when it changes
  const energyRef = useRef(currentEnergy);

  const cfg = ENERGY_CONFIG[currentEnergy];
  const IDLE_MESSAGES = getIdleMessages(currentEnergy, userName || '');

  // ── Handle incoming message prop ──────────────────────────────────────────
  useEffect(() => {
    if (!message) return;
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setCurrentMessage(message);
    setIsTalking(true);
    const t = setTimeout(() => setIsTalking(false), 2000);
    if (!persistent) {
      messageTimerRef.current = setTimeout(() => startIdleMode(), 5000);
    }
    return () => clearTimeout(t);
  }, [message, persistent]);

  // ── Idle message cycling ──────────────────────────────────────────────────
  const startIdleMode = () => {
    const show = () => {
      const msgs = getIdleMessages(energyRef.current, userName || '');
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      setCurrentMessage(msg);
      setIsTalking(true);
      setTimeout(() => setIsTalking(false), 1500);
      idleTimerRef.current = setTimeout(show, 8000 + Math.random() * 4000);
    };
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    show();
  };

  // ── Bounce loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    energyRef.current = currentEnergy;
    if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);

    const bounce = () => {
      const c = ENERGY_CONFIG[energyRef.current];
      const jumpH = c.bounceHeight[0] + Math.random() * (c.bounceHeight[1] - c.bounceHeight[0]);
      const targetX = (Math.random() - 0.5) * c.horizontalRange * 2;

      setBouncePhase('launch');
      setSquash(c.squashMax);
      setPosition({ x: targetX * 0.4, y: -jumpH * 0.4 });

      setTimeout(() => {
        setBouncePhase('rise');
        setSquash(c.squashMax * 0.95);
        setPosition({ x: targetX * 0.8, y: -jumpH * 0.85 });
      }, 150);

      setTimeout(() => {
        setBouncePhase('peak');
        setSquash(1.0);
        setPosition({ x: targetX, y: -jumpH });
      }, 350);

      setTimeout(() => {
        setBouncePhase('fall');
        setSquash(1.03);
        setPosition({ x: targetX, y: -jumpH * 0.6 });
      }, 490);

      setTimeout(() => {
        setSquash(c.squashMax * 1.02);
        setPosition({ x: targetX, y: -jumpH * 0.1 });
      }, 610);

      setTimeout(() => {
        setBouncePhase('impact');
        setSquash(c.squashImpact);
        setPosition({ x: targetX, y: 0 });
      }, 720);

      setTimeout(() => {
        setBouncePhase('rest');
        setSquash(0.94);
        setPosition({ x: targetX, y: -1 });
      }, 820);

      setTimeout(() => {
        setSquash(1.0);
        setPosition({ x: targetX, y: 0 });
      }, 960);

      const next = c.bouncePeriod[0] + Math.random() * (c.bouncePeriod[1] - c.bouncePeriod[0]);
      bounceTimerRef.current = setTimeout(bounce, next);
    };

    const initDelay = currentEnergy === 'high' ? 600 : currentEnergy === 'low' ? 2000 : 1200;
    bounceTimerRef.current = setTimeout(bounce, initDelay);

    if (!message) startIdleMode();

    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [currentEnergy]);

  // ── Derived visuals ───────────────────────────────────────────────────────
  const mascotColor = cfg.color;

  const transitionStyle = (phase: string) => {
    if (phase === 'launch') return 'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1)';
    if (phase === 'rise')   return 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)';
    if (phase === 'peak')   return 'transform 140ms cubic-bezier(0.42, 0, 0.58, 1)';
    if (phase === 'fall')   return 'transform 220ms cubic-bezier(0.4, 0, 0.6, 0.2)';
    if (phase === 'impact') return 'transform 120ms cubic-bezier(0.4, 0, 0.6, 0.2)';
    return 'transform 230ms cubic-bezier(0.34, 1.3, 0.64, 1)';
  };

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ userSelect: 'none' }}>
      {/* Mascot wrapper */}
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {/* Particles */}
        <Particles energy={currentEnergy} mascotColor={mascotColor} />

        {/* Mascot body */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scaleX(${1 / squash}) scaleY(${squash})`,
            transition: transitionStyle(bouncePhase),
            position: 'relative',
          }}
        >
          {/* Aura — grows/shrinks with energy level */}
          <div
            style={{
              position: 'absolute',
              inset: cfg.glowInset,
              borderRadius: '50%',
              background: cfg.glowColor,
              filter: `blur(${cfg.glowSize}px)`,
              transition: 'background 0.5s ease, inset 0.5s ease, filter 0.5s ease',
            }}
          />

          {/* SVG face — original clean design */}
          <svg
            width="80" height="80" viewBox="0 0 100 100"
            style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}
          >
            {/* Body */}
            <circle cx="50" cy="50" r="42"
              fill={mascotColor}
              style={{ transition: 'fill 0.5s ease' }}
            />
            {/* Shine */}
            <ellipse cx="38" cy="30" rx="10" ry="7" fill="rgba(255,255,255,0.25)" />

            {/* Eyes — whites slightly larger than pupils */}
            <ellipse cx="35" cy="42" rx="3.5" ry="4.5" fill="white" />
            <ellipse cx="65" cy="42" rx="3.5" ry="4.5" fill="white" />
            {/* Pupils — small, tight */}
            <circle cx="36" cy="43" r="2.5" fill="#1a1a2e" />
            <circle cx="66" cy="43" r="2.5" fill="#1a1a2e" />
            {/* Eye shine */}
            <circle cx="38" cy="41" r="0.6" fill="white" opacity="0.8" />
            <circle cx="68" cy="41" r="0.6" fill="white" opacity="0.8" />

            {/* Mouth — talking open circle, otherwise consistent smile */}
            {isTalking ? (
              <ellipse cx="50" cy="60" rx="10" ry="8" fill="#1a1a2e" />
            ) : (
              <path d="M 38 55 Q 50 65 62 55"
                stroke="#1a1a2e" strokeWidth="2"
                strokeLinecap="round" fill="none"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Speech bubble */}
      {currentMessage && (
        <div style={{
          position: 'relative',
          marginTop: 12,
          background: 'white',
          borderRadius: 16,
          padding: '8px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          maxWidth: 220,
          textAlign: 'center',
        }}>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: `translateX(calc(-50% + ${Math.max(-40, Math.min(40, position.x))}px))`,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid white',
            transition: 'transform 200ms ease',
          }} />
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
            lineHeight: 1.4,
            margin: 0,
          }}>
            {currentMessage}
          </p>
        </div>
      )}
    </div>
  );
}