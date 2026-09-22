/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b1329',
        foreground: '#f8fafc',
        surface: {
          DEFAULT: '#111c44',
          subtle: '#1b2559',
          border: '#2b3674',
        },
        civic: {
          blue: '#1d4ed8',
          teal: '#0d9488',
          amber: '#d97706',
          red: '#dc2626',
          green: '#16a34a',
        },
      },
    },
  },
  plugins: [],
}
