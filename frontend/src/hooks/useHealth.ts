import { useEffect, useState } from "react";
import { getHealth } from "../api/client";
import type { HealthResponse } from "../api/types";
import type { ConnectionState } from "../components/StatusDot";

const HEALTHY_POLL_MS = 30_000;
const UNHEALTHY_POLL_MS = 5_000;

export function useHealth() {
  const [connection, setConnection] = useState<ConnectionState>("checking");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      try {
        const result = await getHealth();
        if (cancelled) return;
        setHealth(result);
        setConnection("online");
        timer = window.setTimeout(poll, HEALTHY_POLL_MS);
      } catch {
        if (cancelled) return;
        setConnection("offline");
        timer = window.setTimeout(poll, UNHEALTHY_POLL_MS);
      }
    }

    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return { connection, health };
}
