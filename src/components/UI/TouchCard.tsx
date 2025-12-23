import React from 'react';

interface TouchCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

const TouchCard: React.FC<TouchCardProps> = ({ 
  children, 
  onClick, 
  className = '', 
  interactive = false 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const interactiveClasses = interactive 
    ? 'min-h-touch cursor-pointer hover:shadow-md active:shadow-lg transition-shadow duration-200 touch-manipulation' 
    : '';
  
  const classes = `${baseClasses} ${interactiveClasses} ${className}`;

  if (onClick) {
    return (
      <button 
        className={classes}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    );
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default TouchCard;