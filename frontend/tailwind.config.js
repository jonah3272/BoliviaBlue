/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F9FAFB',
          text: '#1F2937',
          red: '#EF4444',
          yellow: '#FBBF24',
          green: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.95', transform: 'scale(1.01)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out',
        shimmer: 'shimmer 1s ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        gradient: 'gradient 3s ease infinite'
      }
    },
  },
  plugins: [],
}

