import React from 'react';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  'aria-describedby'?: string;
}

const TouchButton: React.FC<TouchButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  loading = false,
  disabled,
  ...props 
}) => {
  const baseClasses = 'min-h-touch min-w-touch font-medium rounded-lg transition-all duration-200 flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const loadingClasses = 'cursor-wait';

  const classes = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${(disabled || loading) ? disabledClasses : ''} 
    ${loading ? loadingClasses : ''} 
    ${className}
  `.trim();

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className={loading ? 'sr-only' : ''}>{children}</span>
      {loading && <span aria-live="polite" className="sr-only">加载中...</span>}
    </button>
  );
};

export default TouchButton;