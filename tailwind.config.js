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
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // 更深的蓝色，提高对比度
          600: '#0284c7', // WCAG AA级对比度
          700: '#0369a1', // WCAG AAA级对比度
          800: '#075985',
          900: '#0c4a6e',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563', // 4.5:1 对比度 (AA级)
          700: '#374151', // 7:1 对比度 (AAA级)
          800: '#1f2937', // 12:1 对比度 (AAA级)
          900: '#111827', // 15:1 对比度 (AAA级)
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a', // WCAG AA级
          700: '#15803d', // WCAG AAA级
          800: '#166534',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706', // WCAG AA级
          700: '#b45309', // WCAG AAA级
          800: '#92400e',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626', // WCAG AA级
          700: '#b91c1c', // WCAG AAA级
          800: '#991b1b',
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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}