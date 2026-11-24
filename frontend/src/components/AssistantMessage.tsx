import { Check, Copy } from "@phosphor-icons/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMetadata } from "../api/types";
import { MetaStrip } from "./MetaStrip";

interface AssistantMessageProps {
  content: string;
  metadata: ChatMetadata;
  simulated?: string;
}

export function AssistantMessage({ content, metadata, simulated }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context); nothing useful to show.
    }
  }

  return (
    <article data-testid="assistant-message" className="group/msg bezel max-w-[44rem]">
      <div className="bezel-core relative px-5 py-4 sm:px-6 sm:py-5">
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy reply"}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/40 opacity-0 ring-1 ring-transparent transition-all duration-500 ease-spring hover:bg-white/[0.06] hover:text-white/80 hover:ring-white/[0.08] focus-visible:opacity-100 group-hover/msg:opacity-100"
        >
          {copied ? <Check size={13} weight="light" /> : <Copy size={13} weight="light" />}
        </button>
        <div className="md pr-6 [overflow-wrap:anywhere] text-[15px] leading-relaxed text-white/90">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        <div className="mt-4 border-t border-white/[0.05] pt-3.5">
          <MetaStrip metadata={metadata} simulated={simulated} />
        </div>
      </div>
    </article>
  );
}
