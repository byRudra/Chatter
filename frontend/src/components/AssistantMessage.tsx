import type { ChatMetadata } from "../api/types";

interface AssistantMessageProps {
  content: string;
  metadata: ChatMetadata;
}

export function AssistantMessage({ content }: AssistantMessageProps) {
  return (
    <article data-testid="assistant-message" className="bezel max-w-[44rem]">
      <div className="bezel-core px-5 py-4 sm:px-6 sm:py-5">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{content}</p>
      </div>
    </article>
  );
}
