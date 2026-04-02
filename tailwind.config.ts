import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C8A84B",
          light: "#F0C866",
          dark: "#8A6E1E",
          glow: "rgba(200, 168, 75, 0.3)",
        },
        navy: {
          DEFAULT: "#04091A",
          light: "#070E21",
          card: "#0D1525",
          border: "rgba(255,255,255,0.08)",
        },
        banking: {
          blue: "#1A6EE0",
          "blue-light": "#4D9FFF",
          green: "#00C896",
          red: "#FF4D6D",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        arabic: ["Noto Kufi Arabic", "sans-serif"],
      },
      animation: {
        "gold-shimmer": "goldShimmer 4s ease infinite",
        "pulse-gold": "pulseGold 2s infinite",
        "pulse-blue": "pulseBlue 3s infinite",
        "scan-beam": "scanBeam 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease both",
        "slide-left": "slideLeft 0.5s ease both",
        "success-pop": "successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "border-glow": "borderGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        goldShimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(200, 168, 75, 0.4)" },
          "50%": { boxShadow: "0 0 0 20px rgba(200, 168, 75, 0)" },
        },
        pulseBlue: {
          "0%, 100%": { boxShadow: "0 10px 40px rgba(26,110,224,0.5), 0 0 0 0 rgba(26,110,224,0.3)" },
          "50%": { boxShadow: "0 10px 40px rgba(26,110,224,0.5), 0 0 0 15px rgba(26,110,224,0)" },
        },
        scanBeam: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        successPop: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(200, 168, 75, 0.3)" },
          "50%": { borderColor: "rgba(200, 168, 75, 0.9)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
