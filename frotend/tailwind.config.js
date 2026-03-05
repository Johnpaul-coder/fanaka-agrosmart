/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/component/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        fanaka: {
          green: "#15803d",
          lightGreen: "#bbf7d0",
          orange: "#f97316",
          dark: "#1f2937"
        }
      }
    }
  },
  plugins: []
};

module.exports = config;