import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const baseStyles = 'tap-target font-bold py-4 px-6 rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-dem-green-500 hover:bg-dem-green-600 text-white shadow-lg active:shadow-md active:translate-y-0.5',
    secondary: 'bg-white hover:bg-gray-50 text-dem-green-700 border-2 border-dem-green-200 shadow-md active:shadow-sm active:translate-y-0.5',
    ghost: 'bg-transparent hover:bg-gray-100 text-dem-green-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}