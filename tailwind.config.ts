// tailwind.config.ts
import { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import defaultTheme from "tailwindcss/defaultTheme";

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
        luxury: ["var(--font-luxury)", ...defaultTheme.fontFamily.serif],
        body: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },

        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
      },

      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      const backdrops = theme("backdropBlur", {});
      const utilities = Object.entries(backdrops).map(([key, value]) => ({
        [`.backdrop-blur-${key}`]: {
          "backdrop-filter": `blur(${value})`,
        },
      }));
      addUtilities(utilities, ["responsive"]);
    }),
  ],
};

export default config;
