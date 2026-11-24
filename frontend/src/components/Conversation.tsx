import { useEffect, useRef } from "react";
import type { Turn } from "../hooks/useChat";
import { AssistantMessage } from "./AssistantMessage";
import { EmptyState } from "./EmptyState";
import { ThinkingMessage } from "./ThinkingMessage";
import { UserMessage } from "./UserMessage";

interface ConversationProps {
  turns: Turn[];
  pending: boolean;
  onPickSuggestion: (text: string) => void;
}

export function Conversation({ turns, pending, onPickSuggestion }: ConversationProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, pending]);

  if (turns.length === 0 && !pending) {
    return <EmptyState onPick={onPickSuggestion} />;
  }

  return (
    <div className="flex flex-col gap-5 py-4" aria-live="polite">
      {turns.map((turn) => {
        switch (turn.kind) {
          case "user":
            return <UserMessage key={turn.id} content={turn.content} />;
          case "assistant":
            return (
              <AssistantMessage key={turn.id} content={turn.content} metadata={turn.metadata} />
            );
          default:
            return null;
        }
      })}
      {pending && <ThinkingMessage />}
      <div ref={endRef} />
    </div>
  );
}
