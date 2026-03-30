import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bandit: {
          black: "#0A0A0A",
          green: "#39FF14",
          "green-muted": "#22C55E",
          grey: "#6B7280",
          "grey-light": "#F3F4F6",
          "grey-mid": "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Inter Mono", "monospace"],
      },
      animation: {
        "pulse-green": "pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(57,255,20,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(57,255,20,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
