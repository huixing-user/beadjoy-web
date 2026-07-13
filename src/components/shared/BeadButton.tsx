'use client';

import React from 'react';

type BeadButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export default function BeadButton({
  variant = 'primary', size = 'md', onClick, children, className = '', disabled = false,
}: BeadButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md';
  const variants: Record<string, string> = {
    primary: 'bg-[#FF6B9D] text-white hover:bg-[#e55a8a] shadow-pink-200/50',
    secondary: 'bg-[#4ECDC4] text-white hover:bg-[#3dbdb6] shadow-teal-200/50',
    outline: 'border-2 border-[#FF6B9D] text-[#FF6B9D] bg-white hover:bg-pink-50',
  };
  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-base gap-2',
    lg: 'px-8 py-3.5 text-lg gap-2.5',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}
