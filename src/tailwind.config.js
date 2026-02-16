/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dem-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'dem-yellow': {
          400: '#facc15',
          500: '#eab308',
        },
        'dem-orange': {
          500: '#f97316',
        },
        'dem-blue': {
          50: '#eff6ff',    
          100: '#dbeafe',   
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',   
        },
        'dem-purple': {
          500: '#a855f7',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}