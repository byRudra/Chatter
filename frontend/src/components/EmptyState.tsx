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
      <h1 className="mt-3 max-w-[22ch] font-display text-3xl font-medium leading-[1.1] tracking-[-0.03em] text-ink-800 md:text-[2.5rem]">
        Ask anything. Each answer shows how it was served.
      </h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-ink-600">
        Replies come from a live model call or the response cache. If a key fails, the next one in
        the pool answers. The line under every reply records which.
      </p>

      <motion.ul
        className="mt-10 grid gap-2.5"
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
              className="group flex w-full items-center gap-4 rounded-2xl border border-ink-900/[0.05] bg-surface px-5 py-4 text-left shadow-soft transition-all duration-300 ease-out hover:-translate-y-px hover:shadow-soft-lg active:translate-y-0 active:scale-[0.99]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-ink-800 transition-colors duration-300 group-hover:text-ink-950">
                  {s.prompt}
                </span>
                <span className="mt-0.5 block text-[13px] text-ink-500">{s.hint}</span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-ink-500 transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:text-signal-700"
              />
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
