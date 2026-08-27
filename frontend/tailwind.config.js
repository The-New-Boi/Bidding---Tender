/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gem: {
          blue: '#1a365d',
          orange: '#dd6b20',
          green: '#2f855a'
        }
      }
    },
  },
  plugins: [],
}
