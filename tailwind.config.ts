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
        // Using RGB format for opacity support
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",

        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },

        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },

        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
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
