'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  noPad?: boolean;
}

export function Card({ children, className = '', style, onClick, noPad = false }: CardProps) {
  const base = `bg-white rounded-3xl shadow-dem ${noPad ? '' : 'p-5'}`;
  const clickable = onClick ? 'cursor-pointer' : '';

  if (onClick) {
    return (
      <motion.div
        className={`${base} ${clickable} ${className}`}
        style={style}
        onClick={onClick}
        whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${base} ${className}`} style={style}>
      {children}
    </div>
  );
}
