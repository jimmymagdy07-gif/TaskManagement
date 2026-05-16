/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080810',
          secondary: '#0f0f1a',
          card: '#13131f',
        },
        border: {
          DEFAULT: '#1e1e30',
        },
        accent: {
          DEFAULT: '#7c3aed',
          glow: '#9d5cff',
          cyan: '#06b6d4',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        text: {
          primary: '#f0f0ff',
          muted: '#6b6b8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem)',
        'fluid-base': 'clamp(0.9375rem, 0.875rem + 0.3vw, 1rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.375rem, 1.2rem + 0.75vw, 1.75rem)',
        'fluid-2xl': 'clamp(1.75rem, 1.5rem + 1vw, 2.25rem)',
        'fluid-3xl': 'clamp(2rem, 1.75rem + 1.25vw, 3rem)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(124, 58, 237, 0.4)',
        'glow-sm': '0 0 20px rgba(124, 58, 237, 0.25)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        shimmer: 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.3s ease forwards',
        'slide-in-right': 'slideInRight 0.3s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
