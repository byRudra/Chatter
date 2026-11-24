import { SlidersHorizontal } from "@phosphor-icons/react";
import { Panel } from "./Panel";

interface SystemPromptCardProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemPromptCard({ value, onChange }: SystemPromptCardProps) {
  const active = value.trim().length > 0;
  return (
    <Panel
      icon={SlidersHorizontal}
      title="System prompt"
      aside={
        <span className={`chip ${active ? "text-live ring-live/25" : ""}`}>
          {active ? "custom" : "default"}
        </span>
      }
    >
      <label htmlFor="system-prompt" className="sr-only">
        System prompt
      </label>
      <textarea
        id="system-prompt"
        data-testid="system-prompt-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        maxLength={8000}
        placeholder="e.g. Answer like a patient teacher, in under 80 words."
        className="block w-full resize-none rounded-2xl bg-white/[0.03] px-4 py-3 text-[14px] leading-relaxed text-white/90 ring-1 ring-white/[0.06] transition-shadow duration-500 ease-spring placeholder:text-white/25 focus:outline-none focus:ring-white/20 focus-visible:ring-offset-0"
      />
      <p className="mt-2.5 text-[12px] leading-relaxed text-white/35">
        Sent with your next message and kept for this session. Leave empty to use the server
        default.
      </p>
    </Panel>
  );
}
