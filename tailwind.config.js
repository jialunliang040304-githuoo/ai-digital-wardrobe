/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        'display': ['Bebas Neue', 'Arial Black', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Kinetic Typography Colors - High Contrast
        background: '#000000',
        foreground: '#FFFFFF',
        accent: '#00FF00',
        'accent-alt': '#FF0000',
        'accent-blue': '#0000FF',
        'accent-yellow': '#FFFF00',
        'accent-magenta': '#FF00FF',
        'accent-cyan': '#00FFFF',
        
        // Inverted colors
        'background-inverted': '#FFFFFF',
        'foreground-inverted': '#000000',
        
        // Legacy colors for compatibility (updated to match brutalist theme)
        primary: {
          50: '#000000',
          100: '#1a1a1a',
          200: '#333333',
          300: '#4d4d4d',
          400: '#666666',
          500: '#00FF00',
          600: '#00cc00',
          700: '#009900',
          800: '#006600',
          900: '#003300',
        },
        gray: {
          50: '#000000',
          100: '#1a1a1a',
          200: '#333333',
          300: '#4d4d4d',
          400: '#666666',
          500: '#808080',
          600: '#999999',
          700: '#b3b3b3',
          800: '#cccccc',
          900: '#ffffff',
        },
        success: {
          50: '#000000',
          500: '#00FF00',
          600: '#00cc00',
          700: '#009900',
          800: '#006600',
        },
        warning: {
          50: '#000000',
          500: '#FFFF00',
          600: '#cccc00',
          700: '#999900',
          800: '#666600',
        },
        error: {
          50: '#000000',
          500: '#FF0000',
          600: '#cc0000',
          700: '#990000',
          800: '#660000',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      fontSize: {
        // Viewport-width based typography
        'vw-xs': 'clamp(0.75rem, 2vw, 1rem)',
        'vw-sm': 'clamp(1rem, 3vw, 1.25rem)',
        'vw-base': 'clamp(1.25rem, 4vw, 1.5rem)',
        'vw-lg': 'clamp(1.5rem, 5vw, 2rem)',
        'vw-xl': 'clamp(2rem, 6vw, 3rem)',
        'vw-2xl': 'clamp(3rem, 8vw, 4rem)',
        'vw-3xl': 'clamp(4rem, 10vw, 6rem)',
        'vw-4xl': 'clamp(6rem, 12vw, 8rem)',
        'vw-5xl': 'clamp(8rem, 15vw, 12rem)',
        'vw-6xl': 'clamp(12rem, 20vw, 16rem)',
        
        // Standard sizes for compatibility
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.05em' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '1.05' }],
        '6xl': ['60px', { lineHeight: '1.05' }],
        '7xl': ['72px', { lineHeight: '1.05' }],
        '8xl': ['96px', { lineHeight: '1.05' }],
        '9xl': ['128px', { lineHeight: '1.05' }],
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0em',
        'wide': '0.05em',
        'wider': '0.1em',
        'widest': '0.15em',
      },
      boxShadow: {
        // Brutalist hard shadows
        'brutal': '8px 8px 0px #00FF00',
        'brutal-red': '8px 8px 0px #FF0000',
        'brutal-blue': '8px 8px 0px #0000FF',
        'brutal-yellow': '8px 8px 0px #FFFF00',
        'brutal-white': '8px 8px 0px #FFFFFF',
        'brutal-black': '8px 8px 0px #000000',
        
        // Legacy shadows (minimal for brutalist theme)
        'sm': '2px 2px 0px #333333',
        'md': '4px 4px 0px #333333',
        'lg': '6px 6px 0px #333333',
        'xl': '8px 8px 0px #333333',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // Removed gradients for brutalist flat design
      },
      animation: {
        'marquee-left': 'marquee-left 20s linear infinite',
        'marquee-right': 'marquee-right 25s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'color-shift': 'color-shift 3s ease-in-out infinite',
        
        // Legacy animations (simplified)
        'float': 'glitch 2s ease-in-out infinite',
        'pulse-dot': 'color-shift 2s ease-in-out infinite',
      },
      keyframes: {
        'marquee-left': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-right': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'color-shift': {
          '0%': { color: '#00FF00' },
          '25%': { color: '#FF0000' },
          '50%': { color: '#0000FF' },
          '75%': { color: '#FFFF00' },
          '100%': { color: '#00FF00' },
        },
      },
    },
  },
  plugins: [],
}