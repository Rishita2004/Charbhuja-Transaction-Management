/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f9f4",
          100: "#dcf2e7",
          200: "#bbe5d1",
          300: "#8dd1b3",
          400: "#58b48e",
          500: "#369671",
          600: "#257859",
          700: "#1d5f47",
          800: "#194c39",
          900: "#153f30",
          950: "#0b231b",
        },
      },
    },
  },
  plugins: [],
};
