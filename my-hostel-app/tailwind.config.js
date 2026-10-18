/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f4',
          100: '#dcefe6',
          200: '#bbdfcf',
          300: '#8ec7b0',
          400: '#5da88d',
          500: '#3d8c72',
          600: '#2d6f5b',
          700: '#265a4b',
          800: '#21483e',
          900: '#1c3c34',
          950: '#0d211c',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
