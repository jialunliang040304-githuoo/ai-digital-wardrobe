import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  showArrow = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none group';
  
  const variants = {
    primary: 'bg-gradient-accent text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-muted text-foreground border border-border hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'text-accent hover:bg-accent/10 hover:-translate-y-0.5 active:translate-y-0'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {children}
          {showArrow && (
            <ArrowRight 
              size={16} 
              className="ml-2 transition-transform duration-200 group-hover:translate-x-1" 
            />
          )}
        </>
      )}
    </button>
  );
};

export default Button;