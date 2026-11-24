interface SystemPromptCardProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemPromptCard({ value, onChange }: SystemPromptCardProps) {
  const active = value.trim().length > 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="system-prompt" className="label">
          System prompt
        </label>
        <span className={`font-mono text-[11px] ${active ? "text-signal-700" : "text-ink-500"}`}>
          {active ? "custom" : "default"}
        </span>
      </div>
      <textarea
        id="system-prompt"
        data-testid="system-prompt-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        maxLength={8000}
        placeholder="Answer like a patient teacher, in under 80 words."
        className="field resize-none leading-relaxed"
      />
      <p className="text-[12px] leading-relaxed text-ink-500">
        Sent with your next message and kept for the session.
      </p>
    </div>
  );
}
