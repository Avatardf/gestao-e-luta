/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8edf5',
          100: '#c5d0e6',
          200: '#9fb0d5',
          300: '#7890c4',
          400: '#5a77b9',
          500: '#3d5eae',
          600: '#2d4d9a',
          700: '#1e3b82',
          800: '#132d6b',
          900: '#0D1F3C',
          950: '#071225',
        },
        gold: {
          300: '#f5d87a',
          400: '#f0c84a',
          500: '#C9A227',
          600: '#a8821f',
          700: '#876518',
        },
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
}
