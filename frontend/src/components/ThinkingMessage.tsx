import { LogoMark } from "./Logo";

export function ThinkingMessage() {
  return (
    <div role="status" aria-label="Waiting for a reply" className="flex gap-3.5">
      <LogoMark className="mt-0.5 h-7 w-7" />
      <div className="relative flex-1 space-y-2.5 overflow-hidden pt-2">
        <div className="h-2.5 w-[72%] rounded-full bg-bone-800/80" />
        <div className="h-2.5 w-[54%] rounded-full bg-bone-800/80" />
        <div className="h-2.5 w-[31%] rounded-full bg-bone-800/80" />
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-canvas/70 to-transparent" />
      </div>
    </div>
  );
}
