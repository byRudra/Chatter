import { X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { type FormEvent, useState } from "react";
import { SPRING } from "./Reveal";

const SCENARIOS = [
  { header: "key_1=429", title: "Rate-limit key_1", expect: "key_2 answers" },
  { header: "key_1=500", title: "Crash key_1", expect: "key_2 answers" },
  { header: "key_1=429,key_2=503", title: "Two keys down", expect: "503, not saved" },
  { header: "*=429", title: "Every key down", expect: "503, not saved" },
];

interface FailureLabProps {
  armed: string | null;
  onArm: (header: string | null) => void;
  /** null while health is unknown. */
  enabledOnServer: boolean | null;
}

export function FailureLab({ armed, onArm, enabledOnServer }: FailureLabProps) {
  const [custom, setCustom] = useState("");

  function armCustom(event: FormEvent) {
    event.preventDefault();
    if (custom.trim()) onArm(custom.trim());
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="label">Failure lab</p>
        <span className={`font-mono text-[11px] ${armed ? "text-flare-700" : "text-ink-500"}`}>
          {armed ? "armed" : "idle"}
        </span>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
        Adds <code className="font-mono text-ink-600">X-Simulate-Failure</code> to your next message
        only.
      </p>

      {enabledOnServer === false && (
        <p className="mt-3 border-l-2 border-flare-400/50 pl-3 text-[12px] text-flare-700/90">
          Disabled on this server (ENABLE_FAILURE_SIMULATION=false).
        </p>
      )}

      <ul className="mt-3 space-y-1" role="radiogroup" aria-label="Failure scenario">
        {SCENARIOS.map((scenario) => {
          const active = armed === scenario.header;
          return (
            <li key={scenario.header}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={scenario.title}
                onClick={() => onArm(active ? null : scenario.header)}
                className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-300 ease-out hover:bg-ink-900/[0.03] active:scale-[0.99]"
              >
                {active && (
                  <motion.span
                    layoutId="armed-scenario"
                    transition={SPRING}
                    className="absolute inset-0 rounded-xl border border-flare-400/25 bg-flare-400/[0.06]"
                  />
                )}
                <span
                  className={`relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-flare-500" : "border-ink-400"
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-flare-500" />}
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[13px] text-ink-800">{scenario.title}</span>
                  <span className="block font-mono text-[11px] text-ink-500">
                    {scenario.header}
                  </span>
                </span>
                <span
                  className={`relative shrink-0 text-[11.5px] ${
                    active ? "text-flare-700" : "text-ink-500"
                  }`}
                >
                  {scenario.expect}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={armCustom} className="mt-3 flex gap-2">
        <label htmlFor="custom-failure" className="sr-only">
          Custom X-Simulate-Failure header
        </label>
        <input
          id="custom-failure"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="custom: key_2=502"
          className="field min-w-0 flex-1 font-mono text-[12px]"
        />
        <button
          type="submit"
          disabled={!custom.trim()}
          className="rounded-xl border border-ink-900/[0.08] px-3.5 text-[12.5px] text-ink-700 transition-colors duration-300 ease-out hover:border-ink-900/[0.16] hover:text-ink-950 active:scale-[0.98] disabled:opacity-40"
        >
          Arm
        </button>
      </form>
    </div>
  );
}

export function ArmedBadge({ header, onClear }: { header: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-flare-100 py-1 pl-2.5 pr-1 font-mono text-[11px] text-flare-700 ring-1 ring-inset ring-flare-500/20">
      next: {header}
      <button
        type="button"
        onClick={onClear}
        aria-label="Cancel failure simulation"
        className="flex h-4 w-4 items-center justify-center rounded hover:bg-flare-400/20"
      >
        <X size={10} weight="bold" />
      </button>
    </span>
  );
}
