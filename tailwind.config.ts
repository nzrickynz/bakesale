import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E55937",
          dark: "#d14a2b",
        },
        secondary: {
          DEFAULT: "#FFE974",
          dark: "#f5e15c",
        },
        background: "#F7F6F3",
      },
    },
  },
  plugins: [],
};

export default config; 