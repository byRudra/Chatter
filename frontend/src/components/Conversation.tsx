import { useEffect, useRef } from "react";
import type { Turn } from "../hooks/useChat";
import { AssistantMessage } from "./AssistantMessage";
import { EmptyState } from "./EmptyState";
import { ErrorMessage } from "./ErrorMessage";
import { Reveal } from "./Reveal";
import { ThinkingMessage } from "./ThinkingMessage";
import { UserMessage } from "./UserMessage";

interface ConversationProps {
  turns: Turn[];
  pending: boolean;
  onPickSuggestion: (text: string) => void;
  onRetry: (message: string) => void;
}

export function Conversation({ turns, pending, onPickSuggestion, onRetry }: ConversationProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, pending]);

  if (turns.length === 0 && !pending) {
    return <EmptyState onPick={onPickSuggestion} />;
  }

  function renderTurn(turn: Turn) {
    switch (turn.kind) {
      case "user":
        return <UserMessage content={turn.content} />;
      case "assistant":
        return (
          <AssistantMessage
            content={turn.content}
            metadata={turn.metadata}
            simulated={turn.simulated}
          />
        );
      case "error":
        return (
          <ErrorMessage
            status={turn.status}
            detail={turn.detail}
            // Retry sends the same message again without any failure simulation.
            onRetry={() => onRetry(turn.retry.message)}
            retryDisabled={pending}
          />
        );
    }
  }

  return (
    <div className="flex flex-col gap-8 py-8" aria-live="polite">
      {turns.map((turn) => (
        <Reveal key={turn.id}>{renderTurn(turn)}</Reveal>
      ))}
      {pending && (
        <Reveal>
          <ThinkingMessage />
        </Reveal>
      )}
      <div ref={endRef} />
    </div>
  );
}
