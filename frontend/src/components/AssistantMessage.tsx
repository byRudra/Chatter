import { Check, Copy } from "@phosphor-icons/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMetadata } from "../api/types";
import { LogoMark } from "./Logo";
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
    <div className="group/msg flex gap-3.5">
      <LogoMark className="mt-0.5 h-7 w-7" />
      <article data-testid="assistant-message" className="min-w-0 flex-1">
        <div className="md [overflow-wrap:anywhere]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        <div className="mt-3">
          <MetaStrip
            metadata={metadata}
            simulated={simulated}
            trailing={
              <button
                type="button"
                onClick={copy}
                aria-label={copied ? "Copied" : "Copy reply"}
                className="flex h-6 w-6 items-center justify-center rounded-md text-ink-500 opacity-0 transition-all duration-300 ease-out hover:bg-ink-200 hover:text-ink-800 focus-visible:opacity-100 active:scale-[0.94] group-hover/msg:opacity-100"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            }
          />
        </div>
      </article>
    </div>
  );
}
