import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'inverted';
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
  const baseClasses = 'border-4 transition-all duration-150';
  
  const variants = {
    default: `bg-background text-foreground border-foreground ${hover ? 'hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal' : ''}`,
    elevated: `bg-background text-foreground border-foreground ${hover ? 'hover:translate-x-[-6px] hover:translate-y-[-6px] hover:shadow-brutal-red' : ''}`,
    inverted: `bg-foreground text-background border-background ${hover ? 'hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-white' : ''}`
  };
  
  const interactiveClasses = onClick ? 'cursor-pointer' : '';
  
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