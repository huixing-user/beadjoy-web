import React from 'react';

type BeadCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export default function BeadCard({ children, className = '', hover = true }: BeadCardProps) {
  return (
    <div className={`bg-white rounded-3xl shadow-md shadow-pink-100/50 p-6 ${hover ? 'hover:shadow-lg hover:shadow-pink-100 transition-shadow duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
}
