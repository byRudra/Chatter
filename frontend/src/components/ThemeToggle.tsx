import { Moon, Sun } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Theme } from "../hooks/useTheme";
import { SPRING } from "./Reveal";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const reduce = useReducedMotion();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-900/[0.08] text-ink-700 transition-colors duration-300 ease-out hover:border-ink-900/[0.16] hover:text-ink-950 active:scale-[0.96] lg:h-9 lg:w-9"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="flex"
          initial={reduce ? false : { opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
          transition={SPRING}
        >
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
