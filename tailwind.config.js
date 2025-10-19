/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1', // Indigo-500 as our primary brand color
          light: '#818cf8', // Lighter shade for hover states
          dark: '#4f46e5', // Darker shade for active states
        },
      },
      keyframes: {
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'vinyl-spin': 'spin var(--spin-duration) linear infinite var(--spin-direction)',
      },
    },
  },
  plugins: [],
};