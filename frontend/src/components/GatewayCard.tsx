import { Pulse } from "@phosphor-icons/react";
import type { HealthResponse } from "../api/types";
import type { Turn } from "../hooks/useChat";
import { API_BASE_URL } from "../api/client";
import type { ConnectionState } from "./IslandHeader";

interface GatewayCardProps {
  connection: ConnectionState;
  health: HealthResponse | null;
  turns: Turn[];
}

function average(values: number[]): string {
  if (values.length === 0) return "–";
  return `${Math.round(values.reduce((a, b) => a + b, 0) / values.length)} ms`;
}

export function GatewayCard({ connection, health, turns }: GatewayCardProps) {
  const replies = turns.flatMap((t) => (t.kind === "assistant" ? [t.metadata] : []));
  const live = replies.filter((m) => m.resolution_source === "LIVE_INFERENCE");
  const cached = replies.filter((m) => m.resolution_source === "LLM_CACHE");
  const fallbacks = replies.reduce((sum, m) => sum + m.fallback_attempts, 0);
  const failures = turns.filter((t) => t.kind === "error").length;
  const keyCount = health?.keys_configured ?? 0;

  const statusLabel =
    connection === "online" ? "healthy" : connection === "offline" ? "unreachable" : "checking";
  const statusTone =
    connection === "online"
      ? "text-live ring-live/25"
      : connection === "offline"
        ? "text-danger ring-danger/25"
        : "text-warn ring-warn/25";

  return (
    <section className="bezel">
      <div className="bezel-core px-5 py-4">
        <header className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] text-white/70 ring-1 ring-white/[0.06]">
            <Pulse size={14} weight="light" />
          </span>
          <h2 className="text-[13px] font-medium tracking-tight text-white/85">Gateway</h2>
          <span className={`chip ml-auto ${statusTone}`}>{statusLabel}</span>
        </header>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {Array.from({ length: keyCount }, (_, i) => (
            <span key={i} className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-live/80" />
              key_{i + 1}
            </span>
          ))}
          {health && (
            <span className={`chip ${health.cache_enabled ? "text-cache ring-cache/25" : ""}`}>
              cache {health.cache_enabled ? "on" : "off"}
            </span>
          )}
          {connection === "offline" && (
            <span className="text-[12px] text-white/40">
              Waiting for the backend; it may be waking up.
            </span>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/[0.05] ring-1 ring-white/[0.05]">
          {[
            { label: "live", value: live.length, sub: average(live.map((m) => m.latency_ms)) },
            { label: "cached", value: cached.length, sub: average(cached.map((m) => m.latency_ms)) },
            { label: "fallbacks", value: fallbacks, sub: `${failures} failed` },
          ].map((stat) => (
            <div key={stat.label} className="bg-ink-850 px-3 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                {stat.label}
              </dt>
              <dd className="mt-1.5 text-xl font-medium tabular-nums tracking-tight text-white">
                {stat.value}
              </dd>
              <dd className="font-mono text-[11px] text-white/35">{stat.sub}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 truncate font-mono text-[11px] text-white/25" title={API_BASE_URL}>
          {API_BASE_URL}
        </p>
      </div>
    </section>
  );
}
