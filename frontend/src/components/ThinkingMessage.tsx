export function ThinkingMessage() {
  return (
    <div role="status" aria-label="Waiting for a reply" className="bezel w-full max-w-[22rem]">
      <div className="bezel-core relative space-y-2.5 overflow-hidden px-6 py-5">
        <div className="h-2.5 w-4/5 rounded-full bg-white/[0.06]" />
        <div className="h-2.5 w-3/5 rounded-full bg-white/[0.06]" />
        <div className="h-2.5 w-2/5 rounded-full bg-white/[0.06]" />
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>
    </div>
  );
}
