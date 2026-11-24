import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export const EASE_OUT_EXPO = [0.32, 0.72, 0, 1] as const;
export const SPRING = { type: "spring", stiffness: 100, damping: 20 } as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Heavy fade-up entrance: rises 16px out of a soft blur. Static under reduced motion. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
