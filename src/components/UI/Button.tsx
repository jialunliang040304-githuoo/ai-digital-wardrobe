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
  const baseClasses = 'font-display uppercase tracking-wide border-4 transition-all duration-150 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-accent text-background border-background hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-white active:translate-x-0 active:translate-y-0 active:shadow-brutal-white/50',
    secondary: 'bg-accent-alt text-background border-background hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal-white active:translate-x-0 active:translate-y-0',
    ghost: 'bg-transparent text-foreground border-foreground hover:bg-foreground hover:text-background'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-vw-sm',
    md: 'px-6 py-4 text-vw-base',
    lg: 'px-8 py-6 text-vw-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {children}
          {showArrow && (
            <ArrowRight 
              size={16} 
              className="ml-2 transition-transform duration-150 group-hover:translate-x-1" 
            />
          )}
        </>
      )}
    </button>
  );
};

export default Button;