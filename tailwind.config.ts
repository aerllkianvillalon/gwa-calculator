import type { Config } from "tailwindcss";

// Colors are CSS variables (see app/globals.css) so the same class names work
// in both light and dark mode. `<alpha-value>` keeps opacity utilities working.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: v("ink-900"),
          700: v("ink-700"),
          500: v("ink-500"),
          300: v("ink-300"),
          100: v("ink-100"),
        },
        paper: {
          DEFAULT: v("paper"),
          raised: v("paper-raised"),
        },
        ledger: {
          900: v("ledger-900"),
          700: v("ledger-700"),
          500: v("ledger-500"),
          300: v("ledger-300"),
          100: v("ledger-100"),
          hover: v("ledger-hover"),
        },
        amber: {
          600: "#B8862C",
          500: "#CB9A3E",
          100: "#F6EAD2",
        },
        danger: {
          600: v("danger-600"),
          100: v("danger-100"),
          hover: v("danger-hover"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
