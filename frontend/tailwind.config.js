const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Every colour reads from a CSS variable (see index.css), so the same class
      // renders correctly in both the light and dark themes.
      colors: {
        canvas: v("canvas"),
        surface: v("surface"),
        ink: { 50: v("ink-50"), 100: v("ink-100"), 150: v("ink-150"), 200: v("ink-200"), 300: v("ink-300"), 400: v("ink-400"), 500: v("ink-500"), 600: v("ink-600"), 700: v("ink-700"), 800: v("ink-800"), 900: v("ink-900"), 950: v("ink-950") },
        signal: { 50: v("signal-50"), 100: v("signal-100"), 200: v("signal-200"), 300: v("signal-300"), 400: v("signal-400"), 500: v("signal-500"), 600: v("signal-600"), 700: v("signal-700") },
        flare: { 100: v("flare-100"), 400: v("flare-400"), 500: v("flare-500"), 600: v("flare-600"), 700: v("flare-700") },
        coral: { 100: v("coral-100"), 400: v("coral-400"), 500: v("coral-500"), 600: v("coral-600"), 700: v("coral-700") },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', '"Instrument Sans Variable"', "sans-serif"],
        sans: ['"Instrument Sans Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        // Diffused, warm-tinted elevation instead of hard drop shadows.
        soft: "0 1px 2px rgb(var(--shadow) / 0.05), 0 8px 24px -12px rgb(var(--shadow) / 0.16)",
        "soft-lg": "0 2px 4px rgb(var(--shadow) / 0.04), 0 24px 48px -20px rgb(var(--shadow) / 0.22)",
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
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
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
