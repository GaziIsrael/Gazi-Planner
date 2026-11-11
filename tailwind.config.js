/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif KR"', 'serif'],
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#FBF9F4',
        paperDark: '#1E1E22',
        paperCardDark: '#26262B',
        paperBorder: '#E6E1D6',
        paperBorderDark: '#3A3A40',
        primaryNavy: '#2C3A4E',
        accentRed: '#C24B40',
      }
    },
  },
  plugins: [],
}
