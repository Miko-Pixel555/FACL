/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        secondary: "#4CAF50",
        accent: "#81C784",
        bgGreen: "#F1F8E9",
        success: "#43A047",
      },
    },
  },
  plugins: [],
};
