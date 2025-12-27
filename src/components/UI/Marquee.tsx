import React from 'react';
import MarqueeComponent from 'react-fast-marquee';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({
  children,
  direction = 'left',
  speed = 50,
  className = '',
  pauseOnHover = false
}) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <MarqueeComponent
        direction={direction}
        speed={speed}
        pauseOnHover={pauseOnHover}
        gradient={false}
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
        }}
      >
        {children}
      </MarqueeComponent>
    </div>
  );
};

export default Marquee;