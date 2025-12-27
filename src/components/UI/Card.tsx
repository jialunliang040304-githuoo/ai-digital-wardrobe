import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'inverted' | 'gradient';
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  hover = true
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  
  const variants = {
    default: 'bg-white border border-border shadow-sm',
    inverted: 'bg-foreground text-background',
    gradient: 'bg-gradient-accent text-white'
  };
  
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-1' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes}>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;