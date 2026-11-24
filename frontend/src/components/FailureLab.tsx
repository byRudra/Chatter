import { Flask, X } from "@phosphor-icons/react";
import { type FormEvent, useState } from "react";
import { Panel } from "./Panel";

const SCENARIOS = [
  { header: "key_1=429", title: "Rate-limit key_1", expect: "key_2 answers" },
  { header: "key_1=500", title: "Crash key_1", expect: "key_2 answers" },
  { header: "key_1=429,key_2=503", title: "Two keys down", expect: "503, nothing saved" },
  { header: "*=429", title: "Every key down", expect: "503, nothing saved" },
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
    <Panel
      icon={Flask}
      title="Failure lab"
      aside={
        <span className={`chip ${armed ? "text-warn ring-warn/25" : ""}`}>
          {armed ? "armed" : "idle"}
        </span>
      }
    >
      <p className="text-[12px] leading-relaxed text-white/40">
        Sends <code className="font-mono text-white/60">X-Simulate-Failure</code> with your next
        message only, so you can watch the key pool fail over.
      </p>

      {enabledOnServer === false && (
        <p className="mt-3 rounded-xl bg-warn/[0.06] px-3 py-2 text-[12px] text-warn/90 ring-1 ring-warn/20">
          Simulation is disabled on this server (ENABLE_FAILURE_SIMULATION=false).
        </p>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-2">
        {SCENARIOS.map((scenario) => {
          const active = armed === scenario.header;
          return (
            <li key={scenario.header}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onArm(active ? null : scenario.header)}
                className={`h-full w-full rounded-2xl px-3 py-2.5 text-left ring-1 transition-all duration-500 ease-spring active:scale-[0.98] ${
                  active
                    ? "bg-warn/[0.08] ring-warn/30"
                    : "bg-white/[0.025] ring-white/[0.06] hover:bg-white/[0.05]"
                }`}
              >
                <span className="block text-[13px] text-white/85">{scenario.title}</span>
                <span className="mt-0.5 block font-mono text-[10.5px] text-white/35">
                  {scenario.header}
                </span>
                <span className={`mt-1 block text-[11px] ${active ? "text-warn" : "text-white/40"}`}>
                  → {scenario.expect}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <form onSubmit={armCustom} className="mt-3 flex items-center gap-2">
        <label htmlFor="custom-failure" className="sr-only">
          Custom X-Simulate-Failure header
        </label>
        <input
          id="custom-failure"
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="custom, e.g. key_2=502"
          className="min-w-0 flex-1 rounded-full bg-white/[0.03] px-4 py-2 font-mono text-[12px] text-white/85 ring-1 ring-white/[0.06] placeholder:text-white/25 focus:outline-none focus:ring-white/20 focus-visible:ring-offset-0"
        />
        <button
          type="submit"
          disabled={!custom.trim()}
          className="rounded-full bg-white/[0.06] px-4 py-2 text-[12px] text-white/80 ring-1 ring-white/[0.08] transition-all duration-500 ease-spring hover:bg-white/[0.1] active:scale-[0.98] disabled:opacity-40"
        >
          Arm
        </button>
      </form>
    </Panel>
  );
}

export function ArmedBadge({ header, onClear }: { header: string; onClear: () => void }) {
  return (
    <span className="chip bg-warn/[0.08] pr-1 text-warn ring-warn/25">
      next message simulates {header}
      <button
        type="button"
        onClick={onClear}
        aria-label="Cancel failure simulation"
        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-warn/20"
      >
        <X size={10} weight="light" />
      </button>
    </span>
  );
}
