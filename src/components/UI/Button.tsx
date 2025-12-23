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
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-gradient-accent text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-accent hover:brightness-110 active:scale-[0.98]',
    secondary: 'border border-border bg-transparent text-foreground hover:bg-muted hover:border-accent/30 hover:shadow-sm',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
  };
  
  const sizes = {
    sm: 'h-10 px-4 text-sm rounded-lg',
    md: 'h-12 px-6 text-base rounded-xl',
    lg: 'h-14 px-8 text-lg rounded-xl'
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
              className="transition-transform duration-200 group-hover:translate-x-1" 
            />
          )}
        </>
      )}
    </button>
  );
};

export default Button;