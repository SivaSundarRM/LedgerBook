/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F14",
          900: "#0F151C",
          800: "#161D26",
          700: "#212B37",
          600: "#324255",
          500: "#4A5B70",
          400: "#71879E",
          300: "#A3B5C6",
          200: "#CBD8E3",
          100: "#E7EEF3",
          50: "#F4F8FA",
        },
        moss: {
          600: "#166856",
          500: "#1C8268",
          400: "#2FA187",
          300: "#63C2A8",
          200: "#A6DFCC",
          100: "#DDF3E9",
        },
        amber: {
          600: "#B9670E",
          500: "#D6821A",
          400: "#E9A23F",
        },
        rust: {
          600: "#B4402A",
          500: "#CB4E36",
          400: "#DD6E58",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,15,20,0.06), 0 8px 24px rgba(11,15,20,0.08)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};
