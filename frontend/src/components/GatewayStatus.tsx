import type { HealthResponse } from "../api/types";
import type { Turn } from "../hooks/useChat";
import { StatusDot, type ConnectionState } from "./StatusDot";

interface GatewayStatusProps {
  connection: ConnectionState;
  health: HealthResponse | null;
  turns: Turn[];
}

function average(values: number[]): string {
  if (values.length === 0) return "–";
  return `${Math.round(values.reduce((a, b) => a + b, 0) / values.length)} ms`;
}

const STATUS_LABEL: Record<ConnectionState, string> = {
  checking: "Connecting",
  online: "Healthy",
  offline: "Unreachable",
};

export function GatewayStatus({ connection, health, turns }: GatewayStatusProps) {
  const replies = turns.flatMap((t) => (t.kind === "assistant" ? [t.metadata] : []));
  const live = replies.filter((m) => m.resolution_source === "LIVE_INFERENCE");
  const cached = replies.filter((m) => m.resolution_source === "LLM_CACHE");
  const fallbacks = replies.reduce((sum, m) => sum + m.fallback_attempts, 0);
  const failures = turns.filter((t) => t.kind === "error").length;

  const rows = [
    { label: "Model", value: health?.model ?? "–" },
    {
      label: "Key pool",
      value: health
        ? Array.from({ length: health.keys_configured }, (_, i) => `key_${i + 1}`).join("  ")
        : "–",
    },
    { label: "Cache", value: health ? (health.cache_enabled ? "enabled" : "off") : "–" },
  ];

  const stats = [
    { label: "Live", value: live.length, sub: average(live.map((m) => m.latency_ms)) },
    { label: "Cached", value: cached.length, sub: average(cached.map((m) => m.latency_ms)) },
    { label: "Fallbacks", value: fallbacks, sub: "keys skipped" },
    { label: "Failed", value: failures, sub: "not saved" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="label">Gateway</p>
          <span className="inline-flex items-center gap-2 text-[12px] text-bone-400">
            <StatusDot state={connection} />
            {STATUS_LABEL[connection]}
          </span>
        </div>
        <dl className="mt-3 space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-[13px] text-bone-500">{row.label}</dt>
              <dd className="truncate font-mono text-[12px] text-bone-300" title={row.value}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        {connection === "offline" && (
          <p className="mt-3 text-[12px] leading-relaxed text-bone-500">
            The backend isn't answering. A sleeping free-tier host can take a moment to wake.
          </p>
        )}
      </div>

      <div>
        <p className="label">This session</p>
        <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-white/[0.06]">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-3.5 py-3 ${i % 2 === 1 ? "border-l border-white/[0.06]" : ""} ${
                i > 1 ? "border-t border-white/[0.06]" : ""
              }`}
            >
              <dt className="text-[12px] text-bone-500">{stat.label}</dt>
              <dd className="mt-1 font-mono text-lg tabular-nums leading-none text-bone-50">
                {stat.value}
              </dd>
              <dd className="mt-1 font-mono text-[11px] text-bone-500">{stat.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
