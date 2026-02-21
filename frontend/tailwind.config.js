/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        primary:"#2F4DA0",
        lightGray:"#F4F6F8"
      }
    },
    },
    plugins: [require("@tailwindcss/typography")],
  };

