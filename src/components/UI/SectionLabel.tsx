import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium ${className}`}>
      <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse-dot" />
      {children}
    </div>
  );
};

export default SectionLabel;