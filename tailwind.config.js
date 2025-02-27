/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "music-primary": "#2C3E50",
        "music-secondary": "#3498DB",
        "music-accent": "#E74C3C",
      },
    },
  },
  plugins: [],
};
