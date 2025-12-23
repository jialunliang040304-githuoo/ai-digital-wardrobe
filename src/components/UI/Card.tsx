import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'featured';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  hover = true
}) => {
  const baseClasses = 'rounded-xl border border-border transition-all duration-300';
  
  const variants = {
    default: `bg-card shadow-md ${hover ? 'hover:shadow-xl hover:bg-gradient-to-br hover:from-accent/[0.03] hover:to-transparent' : ''}`,
    elevated: `bg-card shadow-lg ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}`,
    featured: 'bg-gradient-accent p-[2px] shadow-accent'
  };
  
  const interactiveClasses = onClick ? 'cursor-pointer' : '';
  
  if (variant === 'featured') {
    return (
      <div 
        className={`${baseClasses} ${variants[variant]} ${interactiveClasses} ${className}`}
        onClick={onClick}
      >
        <div className="h-full w-full rounded-[10px] bg-card p-6">
          {children}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${interactiveClasses} p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;