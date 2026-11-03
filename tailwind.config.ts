import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Cairo", "Tajawal", "sans-serif"] },
      colors: {
        navy: {
          800: "#111a2e",
          900: "#0b1220",
        },
      },
    },
  },
  plugins: [],
};

export default config;
