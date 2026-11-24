import type { ChatMetadata } from "../api/types";
import { MetaStrip } from "./MetaStrip";

interface AssistantMessageProps {
  content: string;
  metadata: ChatMetadata;
  simulated?: string;
}

export function AssistantMessage({ content, metadata, simulated }: AssistantMessageProps) {
  return (
    <article data-testid="assistant-message" className="bezel max-w-[44rem]">
      <div className="bezel-core px-5 py-4 sm:px-6 sm:py-5">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/90">{content}</p>
        <div className="mt-4 border-t border-white/[0.05] pt-3.5">
          <MetaStrip metadata={metadata} simulated={simulated} />
        </div>
      </div>
    </article>
  );
}
