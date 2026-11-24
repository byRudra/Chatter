/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm graphite base; reads like an instrument panel rather than a cold zinc UI.
        canvas: "#0c0b09",
        // Warm neutral scale for text, surfaces and hairlines.
        bone: {
          50: "#f6f2ea",
          100: "#ece6d9",
          200: "#d9d2c3",
          300: "#bdb5a5",
          400: "#a29b8c",
          500: "#857f71",
          600: "#666155",
          700: "#48443c",
          800: "#2c2925",
          850: "#221f1b",
          900: "#191714",
          950: "#110f0d",
        },
        // The single accent: live signal.
        signal: {
          300: "#dcf78f",
          400: "#c8ef5a",
          500: "#a9d33a",
        },
        // Semantic states only.
        flare: { 300: "#ffb38a", 400: "#ff8f52" },
        coral: { 300: "#ffa196", 400: "#ff7466" },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', '"Instrument Sans Variable"', "sans-serif"],
        sans: ['"Instrument Sans Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        breathe: "breathe 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite",
      },
    },
  },
  plugins: [],
};
