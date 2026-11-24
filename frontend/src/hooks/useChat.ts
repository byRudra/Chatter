import { useCallback, useRef, useState } from "react";
import { ApiError, sendChat } from "../api/client";
import type { ChatMetadata } from "../api/types";

export type Turn =
  | { id: string; kind: "user"; content: string }
  | {
      id: string;
      kind: "assistant";
      content: string;
      metadata: ChatMetadata;
      simulated?: string;
    }
  | {
      id: string;
      kind: "error";
      status: number;
      detail: string;
      retry: { message: string; simulate?: string };
    };

export interface SendOptions {
  systemPrompt?: string;
  simulate?: string;
}

function randomId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** A fresh, client-generated session id; every page load starts a new session. */
export function newSessionId(): string {
  return `s-${randomId().replace(/-/g, "").slice(0, 12)}`;
}

export function useChat() {
  const [sessionId, setSessionId] = useState(newSessionId);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  const send = useCallback(
    async (rawMessage: string, options: SendOptions = {}) => {
      const message = rawMessage.trim();
      if (!message || inFlight.current) return;
      inFlight.current = true;
      setPending(true);

      // A retried message replaces its error card instead of duplicating the user turn.
      setTurns((prev) => [
        ...prev.filter((t) => !(t.kind === "error" && t.retry.message === message)),
        ...(prev.some((t) => t.kind === "error" && t.retry.message === message)
          ? []
          : [{ id: randomId(), kind: "user" as const, content: message }]),
      ]);

      try {
        const systemPrompt = options.systemPrompt?.trim();
        const response = await sendChat(
          {
            session_id: sessionId,
            message,
            ...(systemPrompt ? { system_prompt: systemPrompt } : {}),
          },
          options.simulate,
        );
        setTurns((prev) => [
          ...prev,
          {
            id: randomId(),
            kind: "assistant",
            content: response.reply,
            metadata: response.metadata,
            simulated: options.simulate,
          },
        ]);
      } catch (error) {
        const apiError =
          error instanceof ApiError ? error : new ApiError(0, "Something went wrong.");
        setTurns((prev) => [
          ...prev,
          {
            id: randomId(),
            kind: "error",
            status: apiError.status,
            detail: apiError.detail,
            retry: { message, simulate: options.simulate },
          },
        ]);
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    },
    [sessionId],
  );

  const reset = useCallback(() => {
    if (inFlight.current) return;
    setTurns([]);
    setSessionId(newSessionId());
  }, []);

  return { sessionId, turns, pending, send, reset };
}
