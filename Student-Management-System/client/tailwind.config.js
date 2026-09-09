/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172126",
        muted: "#6b7a7f",
        line: "#dbe5e5",
        mint: "#dff4ed",
        teal: "#13795b",
        coral: "#ee8065",
        sand: "#f7f8f5",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: { soft: "0 12px 36px rgba(30, 52, 51, .08)" },
    },
  },
  plugins: [],
};
