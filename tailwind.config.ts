import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        ink: {
          900: '#05070E',
          800: '#0B0F1A',
          700: '#11162A',
          600: '#1A2040',
          500: '#252B52',
        },
      },
      backgroundImage: {
        'grid-slate':
          'linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)',
        'radial-glow':
          'radial-gradient(600px circle at 50% 0%, rgba(139, 92, 246, 0.15), transparent 50%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,0.35), 0 8px 40px -8px rgba(139,92,246,0.45)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.8)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '80%,100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
