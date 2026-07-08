/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jc: {
          purple: {
            50:  '#F5F3FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
            300: '#C4B5FD',
            400: '#A78BFA',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6C2BD9',
            800: '#5B21B6',
            900: '#4C1D95',
          },
          gold: {
            300: '#FDE68A',
            400: '#FCD34D',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        jc:    '0 4px 24px rgba(108, 43, 217, 0.12)',
        'jc-lg': '0 8px 40px rgba(108, 43, 217, 0.18)',
      },
    },
  },
  plugins: [],
};
