/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:      'var(--bg)',
        surface: 'var(--surface)',
        text:    'var(--text)',
        accent:  'var(--accent)',
        border:  'var(--border)',
      },
    },
  },
  plugins: [],
};
