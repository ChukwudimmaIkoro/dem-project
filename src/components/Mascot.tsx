'use client';

import { useEffect, useState, useRef } from 'react';

interface MascotProps {
  message?: string;
  mood?: 'happy' | 'excited' | 'calm' | 'encouraging';
  className?: string;
  persistent?: boolean; // If true, shows message permanently
  currentEnergy?: 'low' | 'medium' | 'high'; // Current energy level for color
  userName?: string; // User's name for personalized messages
}

export default function Mascot({ message, mood = 'happy', className = '', persistent = false, currentEnergy = 'medium', userName }: MascotProps) {
  const [isTalking, setIsTalking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(message || '');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [squash, setSquash] = useState(1); // Squash/stretch effect
  const [idleMessageIndex, setIdleMessageIndex] = useState(0);
  const [bouncePhase, setBouncePhase] = useState<'rest' | 'launch' | 'rise' | 'peak' | 'fall' | 'impact'>('rest');
  const messageTimerRef = useRef<NodeJS.Timeout>();
  const bounceTimerRef = useRef<NodeJS.Timeout>();
  const idleTimerRef = useRef<NodeJS.Timeout>();
  
  // Generate idle messages with name (or "Friend" as fallback)
  const getIdleMessages = () => {
    const displayName = userName || 'Friend';
    
    return [
      "You've got this! 💪",
      "One step at a time! 🌟",
      "Proud of you! ⭐",
      "Keep going! 🚀",
      "You're doing great! 🎉",
      `How's it going, ${displayName}? 😊`,
      `${displayName}, ${displayName}... that's a fun thing to say! 😄`,
      `You're amazing, ${displayName}! ✨`,
      `${displayName} is crushing it! 🔥`,
    ];
  };
  
  const IDLE_MESSAGES = getIdleMessages();

  // Handle new message from parent
  useEffect(() => {
    if (message) {
      // Clear any existing timers
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      // Show message and start talking
      setCurrentMessage(message);
      setIsTalking(true);
      
      // Stop talking after 2 seconds
      const talkTimer = setTimeout(() => setIsTalking(false), 2000);
      
      // If not persistent, go back to idle messages after 5 seconds
      if (!persistent) {
        messageTimerRef.current = setTimeout(() => {
          startIdleMode();
        }, 5000);
      }
      
      return () => clearTimeout(talkTimer);
    }
  }, [message, persistent]);

  // Start idle mode with random messages
  const startIdleMode = () => {
    const showRandomMessage = () => {
      const randomIndex = Math.floor(Math.random() * IDLE_MESSAGES.length);
      setIdleMessageIndex(randomIndex);
      setCurrentMessage(IDLE_MESSAGES[randomIndex]);
      setIsTalking(true);
      
      // Stop talking after 1.5 seconds
      setTimeout(() => setIsTalking(false), 1500);
      
      // Show next message in 8-12 seconds
      const nextDelay = 8000 + Math.random() * 4000;
      idleTimerRef.current = setTimeout(showRandomMessage, nextDelay);
    };
    
    // Clear any existing idle timer first
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    showRandomMessage();
  };

  // Bouncing animation with realistic physics
  useEffect(() => {
    const bounce = () => {
      // Random horizontal target (smaller range for less chaos)
      const targetX = (Math.random() - 0.5) * 20; // Reduced from 30 to 20
      const jumpHeight = 12 + Math.random() * 8; // Reduced from 15-25 to 12-20
      
      // LAUNCH PHASE: Fast start, stretch upward
      setBouncePhase('launch');
      setSquash(1.12); // Reduced stretch
      setPosition({ x: targetX * 0.5, y: -jumpHeight * 0.4 });
      
      // RISE PHASE: Continue upward, slowing down
      setTimeout(() => {
        setBouncePhase('rise');
        setSquash(1.08);
        setPosition({ x: targetX * 0.8, y: -jumpHeight * 0.85 });
      }, 150); // Slightly longer
      
      // PEAK PHASE: Slowest point, hang time
      setTimeout(() => {
        setBouncePhase('peak');
        setSquash(1.0);
        setPosition({ x: targetX, y: -jumpHeight });
      }, 350); // Longer hang time
      
      // FALL START: Begin descent, slow at first
      setTimeout(() => {
        setBouncePhase('fall');
        setSquash(1.03);
        setPosition({ x: targetX, y: -jumpHeight * 0.7 });
      }, 480);
      
      // FALL ACCELERATION: Speed up, stretch downward
      setTimeout(() => {
        setSquash(1.15); // Reduced max stretch
        setPosition({ x: targetX, y: -jumpHeight * 0.15 });
      }, 600);
      
      // IMPACT: Hit ground with squash
      setTimeout(() => {
        setBouncePhase('impact');
        setSquash(0.75); // Less extreme squash
        setPosition({ x: targetX, y: 0 });
      }, 720);
      
      // RECOVER: Bounce and settle
      setTimeout(() => {
        setBouncePhase('rest');
        setSquash(0.92);
        setPosition({ x: targetX, y: -1 });
      }, 820);
      
      setTimeout(() => {
        setSquash(1.0);
        setPosition({ x: targetX, y: 0 });
      }, 950);
      
      // Next bounce in 3-6 seconds (longer intervals)
      const nextBounce = 3000 + Math.random() * 3000;
      bounceTimerRef.current = setTimeout(bounce, nextBounce);
    };
    
    // Start bouncing after a short delay
    setTimeout(bounce, 1500);
    
    // Start idle messages if no message provided
    if (!message) {
      startIdleMode();
    }
    
    return () => {
      if (bounceTimerRef.current) clearTimeout(bounceTimerRef.current);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Mood-based colors (with energy override)
  const energyColors = {
    high: '#22c55e', // Green
    medium: '#eab308', // Yellow
    low: '#3b82f6', // Blue
  };
  
  const moodColors = {
    happy: energyColors[currentEnergy],
    excited: '#f97316',
    calm: energyColors[currentEnergy],
    encouraging: '#a855f7',
  };
  
  const currentColor = moodColors[mood];

  // Calculate speech bubble arrow position based on mascot position
  const arrowOffset = position.x;

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* Mascot SVG with position and squash/stretch */}
      <div 
        className="relative"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${1 / squash}, ${squash})`,
          transition: bouncePhase === 'launch' ? 'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1)' : // Smoother launch
                      bouncePhase === 'rise' ? 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)' : // Smoother rise
                      bouncePhase === 'peak' ? 'transform 130ms cubic-bezier(0.42, 0, 0.58, 1)' : // Gentle peak
                      bouncePhase === 'fall' ? 'transform 220ms cubic-bezier(0.4, 0, 0.6, 0.2)' : // Smoother fall
                      bouncePhase === 'impact' ? 'transform 120ms cubic-bezier(0.4, 0, 0.6, 0.2)' : // Softer impact
                      'transform 230ms cubic-bezier(0.34, 1.3, 0.64, 1)', // Gentler settle
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Main body circle with smooth color transition */}
          <circle cx="40" cy="45" r="30" fill={currentColor} style={{ transition: 'fill 0.5s ease-in-out' }} />
          
          {/* Eyes */}
          <circle cx="32" cy="40" r="3" fill="white" />
          <circle cx="48" cy="40" r="3" fill="white" />
          <circle cx="33" cy="40" r="1.5" fill="#1f2937" />
          <circle cx="49" cy="40" r="1.5" fill="#1f2937" />
          
          {/* Mouth - animated when talking */}
          {isTalking ? (
            // Talking mouth (open/close animation via CSS)
            <>
              <ellipse 
                cx="40" 
                cy="52" 
                rx="6" 
                ry="4" 
                fill="#1f2937"
                className="animate-pulse"
              />
            </>
          ) : (
            // Smile
            <path
              d="M 30 50 Q 40 56 50 50"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
          
          {/* Arms (tiny circles) */}
          <circle cx="15" cy="45" r="6" fill={currentColor} opacity="0.8" style={{ transition: 'fill 0.5s ease-in-out' }} />
          <circle cx="65" cy="45" r="6" fill={currentColor} opacity="0.8" style={{ transition: 'fill 0.5s ease-in-out' }} />
          
          {/* Shine effect */}
          <circle cx="32" cy="35" r="4" fill="white" opacity="0.4" />
        </svg>
      </div>

      {/* Speech bubble with dynamic arrow position */}
      {currentMessage && (
        <div className="relative mt-3">
          <div className="bg-white rounded-2xl shadow-lg p-3 max-w-xs relative animate-fade-in">
            {/* Triangle pointer - follows mascot */}
            <div 
              className="absolute -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white transition-all duration-300"
              style={{
                left: `calc(50% + ${arrowOffset}px)`,
                transform: 'translateX(-50%)',
              }}
            />
            <p className="text-sm text-gray-700 text-center font-medium">
              {currentMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}