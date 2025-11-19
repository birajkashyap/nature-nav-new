import { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import defaultTheme from "tailwindcss/defaultTheme"; // ✅ Corrected import

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Accessing the fontFamily property from the imported defaultTheme object
        luxury: ["var(--font-luxury)", ...defaultTheme.fontFamily.serif],
        body: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        accent: {
          // New warmer gold color scheme
          DEFAULT: "#E5B84B", // Light Mode Accent
          dark: "#F0D488", // Dark Mode Accent
          foreground: "#FAFAFA",
        },
        // Relying on CSS variables defined in globals.css
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        muted: "var(--muted)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [
    // FIX: Removed 'e' argument and simplified class name generation
    plugin(({ addUtilities, theme }) => {
      const backdrops = theme("backdropBlur", {});
      const utilities = Object.entries(backdrops).map(([key, value]) => ({
        // Simplified class name definition, removing the need for 'e'
        [`.backdrop-blur-${key}`]: {
          "backdrop-filter": `blur(${value})`,
        },
      }));
      addUtilities(utilities, ["responsive"]);
    }),
  ],
};

export default config;
