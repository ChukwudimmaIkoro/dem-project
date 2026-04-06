'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  energyColor?: string; // override primary color for energy-reactive buttons
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
  energyColor,
}: ButtonProps) {
  const base =
    'tap-target relative inline-flex items-center justify-center font-bold rounded-2xl transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'bg-dem-green-500 text-white btn-3d py-4 px-6',
    secondary: 'bg-white text-dem-green-700 border-2 border-dem-green-200 btn-3d py-4 px-6',
    ghost:     'bg-transparent text-dem-green-700 hover:bg-dem-green-50 py-3 px-4',
    danger:    'bg-red-500 text-white btn-3d py-4 px-6',
  };

  const style = energyColor && variant === 'primary'
    ? { backgroundColor: energyColor, boxShadow: `0 5px 0 0 rgba(0,0,0,0.2)` }
    : undefined;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
      whileTap={disabled ? {} : { scale: 0.96, y: 2 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.button>
  );
}
