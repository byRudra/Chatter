export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="relative flex h-5 w-8 items-center">
        <span className="absolute left-0 h-5 w-5 rounded-full bg-live/90 shadow-[0_0_16px_rgb(52_211_153/0.55)]" />
        <span className="absolute left-3 h-5 w-5 rounded-full bg-cache/80 mix-blend-screen shadow-[0_0_16px_rgb(167_139_250/0.5)]" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">chatter</span>
    </span>
  );
}
