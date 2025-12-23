import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  animated?: boolean;
  className?: string;
}

const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  animated = false,
  className = ''
}) => {
  return (
    <div className={`section-label ${className}`}>
      <span 
        className={`section-label-dot ${animated ? 'animate-pulse-dot' : ''}`}
      />
      <span className="section-label-text">
        {children}
      </span>
    </div>
  );
};

export default SectionLabel;