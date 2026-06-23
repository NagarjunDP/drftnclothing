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
          black: "#0A0A0A",
          offwhite: "#F5F5F0",
          red: "#E63329",
          charcoal: "#1A1A1A",
          gray: "#8A8A8A",
        },
      },
    },
  },
  plugins: [],
};
export default config;
