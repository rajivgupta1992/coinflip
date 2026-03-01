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
        background: "#0d0d0d",
        surface: "#1a1a1a",
        "surface-2": "#242424",
        accent: "#22c55e",
        "accent-dim": "#16a34a",
        danger: "#ef4444",
        "danger-dim": "#b91c1c",
        muted: "#6b7280",
        "text-primary": "#f9fafb",
        "text-secondary": "#9ca3af",
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
      },
      animation: {
        "spin-coin": "spinCoin 0.6s linear infinite",
        "coin-flip": "coinFlip 1s ease-in-out infinite",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-in": "bounceIn 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        confetti: "confettiFall 1s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        spinCoin: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        coinFlip: {
          "0%": { transform: "rotateY(0deg) scale(1)" },
          "25%": { transform: "rotateY(90deg) scale(0.8)" },
          "50%": { transform: "rotateY(180deg) scale(1)" },
          "75%": { transform: "rotateY(270deg) scale(0.8)" },
          "100%": { transform: "rotateY(360deg) scale(1)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100px) rotate(720deg)", opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
