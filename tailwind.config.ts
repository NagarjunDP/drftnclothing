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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          black: "#080808",
          offwhite: "#F2F0EB",
          cream: "#EAE7E0",
          red: "#C8392A",
          crimson: "#8B1A1A",
          charcoal: "#141414",
          graphite: "#1E1E1E",
          muted: "#2C2C2C",
          gray: "#6B6B6B",
          silver: "#9A9A9A",
          gold: "#B8965A",
          goldLight: "#D4AF6E",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
        heading: ["'Outfit'", "sans-serif"],
      },
      letterSpacing: {
        "ultra": "0.35em",
        "wider-xl": "0.25em",
        "wider-lg": "0.15em",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease forwards",
        "fade-in": "fadeIn 0.6s ease forwards",
        "scale-in": "scaleIn 0.3s ease forwards",
        "shimmer": "shimmer 2s linear infinite",
        "slide-in-right": "slideInRight 0.5s ease forwards",
        "slide-in-left": "slideInLeft 0.5s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;
