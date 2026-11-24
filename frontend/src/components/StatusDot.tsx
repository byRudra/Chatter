import { memo } from "react";

export type ConnectionState = "checking" | "online" | "offline";

const TONE: Record<ConnectionState, string> = {
  checking: "bg-flare-500",
  online: "bg-signal-500",
  offline: "bg-coral-500",
};

/** Breathing status indicator; the ring animation is pure CSS and isolated here. */
export const StatusDot = memo(function StatusDot({ state }: { state: ConnectionState }) {
  return (
    <span className="relative flex h-2 w-2">
      {state !== "offline" && (
        <span className={`absolute inset-0 animate-breathe rounded-full ${TONE[state]}`} />
      )}
      <span className={`relative h-2 w-2 rounded-full ${TONE[state]}`} />
    </span>
  );
});
