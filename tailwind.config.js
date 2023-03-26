const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        // 'primary' | 'success' | 'neutral' | 'warning' | 'danger' | 'canvas
        success: colors.green,
        warning: colors.amber,
        danger: colors.red,
        neutral: colors.neutral,
        primary: {
          50: "#E9F4F6",
          100: "#D7EBEF",
          200: "#AFD7DE",
          300: "#84C1CD",
          400: "#5CACBC",
          500: "#41909F",
          600: "#34727F",
          700: "#26555E",
          800: "#1B3B41",
          900: "#0D1D21"
        },
        text: colors.gray,
        canvas: colors.stone,
      },
    },
  },
  plugins: [],
}