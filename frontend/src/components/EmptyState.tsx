import { ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";
import { SPRING } from "./Reveal";

const SUGGESTIONS = [
  {
    prompt: "What is the capital of France?",
    hint: "Send it again after New chat and it comes back from the cache",
  },
  {
    prompt: "Explain API key failover in two sentences.",
    hint: "Then pick a scenario in the failure lab and ask again",
  },
  {
    prompt: "My name is Ada. Remember it.",
    hint: "Follow up with “What is my name?” to check memory",
  },
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-full flex-col justify-center pb-10 pt-16">
      <p className="label">New session</p>
      <h1 className="mt-3 max-w-[22ch] font-display text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-bone-50 md:text-[2.5rem]">
        Ask anything. Each answer shows how it was served.
      </h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-bone-400">
        Replies come from a live model call or the response cache. If a key fails, the next one in
        the pool answers. The line under every reply records which.
      </p>

      <motion.ul
        className="mt-10 divide-y divide-white/[0.06] border-y border-white/[0.06]"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      >
        {SUGGESTIONS.map((s) => (
          <motion.li
            key={s.prompt}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: SPRING } }}
          >
            <button
              type="button"
              onClick={() => onPick(s.prompt)}
              className="group flex w-full items-center gap-4 py-4 text-left transition-colors duration-300 ease-out"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-bone-200 transition-colors duration-300 group-hover:text-bone-50">
                  {s.prompt}
                </span>
                <span className="mt-0.5 block text-[13px] text-bone-500">{s.hint}</span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-bone-500 transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:text-signal-300"
              />
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
