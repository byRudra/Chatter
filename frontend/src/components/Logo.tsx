/** Wordmark: a single signal dot on a soft white tile. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center rounded-lg border border-ink-900/[0.06] bg-surface shadow-soft ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-signal-500" />
    </span>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink-950">chatter</span>
    </span>
  );
}
