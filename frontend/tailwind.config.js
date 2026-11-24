/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#050505",
          900: "#08080a",
          850: "#0b0b0e",
          800: "#101014",
        },
        live: "#34d399",
        cache: "#a78bfa",
        warn: "#fbbf24",
        danger: "#fb7185",
      },
      fontFamily: {
        sans: ['"Geist Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono Variable"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      borderRadius: {
        bezel: "1.75rem",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(3%, -4%, 0) scale(1.06)" },
        },
        "ping-soft": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s cubic-bezier(0.32, 0.72, 0, 1) infinite",
        drift: "drift 22s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "drift-slow": "drift 30s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse",
        "ping-soft": "ping-soft 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
