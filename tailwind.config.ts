import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hp: {
          blue: "#0096D6",
          "blue-dark": "#0073A8",
          "blue-light": "#E6F4FA",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F1F1F1",
        },
        text: {
          DEFAULT: "#212121",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["'Segoe UI'", "'SF Pro Display'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
