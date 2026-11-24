import { ArrowUpRight } from "@phosphor-icons/react";

const SUGGESTIONS = [
  { label: "What is the capital of France?", hint: "Send it twice, in two chats, to see a cache hit" },
  { label: "Explain API key failover in two sentences.", hint: "Then arm the failure lab and ask again" },
  { label: "My name is Ada. Remember it.", hint: "Follow up with “What is my name?”" },
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col justify-center py-10">
      <span className="eyebrow self-start">New conversation</span>
      <h2 className="mt-5 max-w-lg text-3xl font-medium leading-tight tracking-[-0.03em] text-white sm:text-4xl">
        Ask anything. Watch how it&rsquo;s served.
      </h2>
      <ul className="mt-8 grid gap-3">
        {SUGGESTIONS.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => onPick(s.label)}
              className="group flex w-full items-center gap-4 rounded-2xl bg-white/[0.025] p-4 text-left ring-1 ring-white/[0.06] transition-all duration-500 ease-spring hover:bg-white/[0.05] hover:ring-white/[0.12] active:scale-[0.99]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-white/85">{s.label}</span>
                <span className="mt-1 block text-[13px] text-white/40">{s.hint}</span>
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition-transform duration-500 ease-spring group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105">
                <ArrowUpRight size={14} weight="light" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
