import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const baseStyles = 'bg-white rounded-3xl shadow-lg p-6';
  const clickable = onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : '';
  
  return (
    <div 
      className={`${baseStyles} ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}