/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'techno-bg': '#0f0f1a',
        'techno-purple': '#a855f7',
        'techno-blue': '#00d4ff',
        'techno-dark': '#1a0033',
      },
    },
  },
  plugins: [],
}