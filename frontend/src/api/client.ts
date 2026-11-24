import type { ChatRequest, ChatResponse, HealthResponse } from "./types";

const REQUEST_TIMEOUT_MS = 90_000;

function resolveBaseUrl(): string {
  const runtime = window.__CHATTER_CONFIG__?.apiBaseUrl?.trim();
  const buildTime = import.meta.env.VITE_API_BASE_URL?.trim();
  return (runtime || buildTime || "http://localhost:8000").replace(/\/+$/, "");
}

export const API_BASE_URL = resolveBaseUrl();

/** Every failure the UI can show: HTTP errors keep their status, network errors use 0. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

interface ValidationIssue {
  loc?: (string | number)[];
  msg?: string;
}

function describeDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((issue: ValidationIssue) => {
        const field = issue.loc?.filter((part) => part !== "body").join(".");
        return field ? `${field}: ${issue.msg}` : (issue.msg ?? "invalid request");
      })
      .join("; ");
  }
  return "Unexpected error";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    throw new ApiError(
      0,
      timedOut ? "The server took too long to respond." : "Can't reach the server.",
    );
  } finally {
    window.clearTimeout(timer);
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = (body as { detail?: unknown } | null)?.detail;
    throw new ApiError(response.status, describeDetail(detail ?? response.statusText));
  }
  return body as T;
}

export function sendChat(payload: ChatRequest, simulateFailure?: string): Promise<ChatResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (simulateFailure) headers["X-Simulate-Failure"] = simulateFailure;
  return request<ChatResponse>("/chat", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}
