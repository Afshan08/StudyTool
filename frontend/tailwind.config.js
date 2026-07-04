/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        darkBg: '#090d16',
        darkCard: 'rgba(21, 30, 48, 0.6)',
        darkBorder: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
}
