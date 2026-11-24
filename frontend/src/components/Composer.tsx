import { ArrowUp } from "@phosphor-icons/react";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

export const MAX_MESSAGE_CHARS = 4000;

interface ComposerProps {
  onSend: (message: string) => void;
  busy: boolean;
  /** Extra controls rendered in the footer row, e.g. an armed failure simulation. */
  footer?: React.ReactNode;
}

export function Composer({ onSend, busy, footer }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const length = value.trim().length;
  const canSend = length > 0 && !busy;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(value);
    setValue("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  const overLimit = length > MAX_MESSAGE_CHARS;
  const nearLimit = length > MAX_MESSAGE_CHARS * 0.85;

  return (
    <form onSubmit={submit} className="bezel">
      <div className="bezel-core px-4 pb-3 pt-3.5 sm:px-5">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          data-testid="chat-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Ask anything…"
          className="block max-h-[200px] w-full resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="mt-3 flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {footer}
            <span className="hidden font-mono text-[11px] text-white/30 sm:inline">
              Enter to send · Shift+Enter for a new line
            </span>
          </div>
          {nearLimit && (
            <span
              className={`font-mono text-[11px] ${overLimit ? "text-danger" : "text-warn"}`}
              aria-live="polite"
            >
              {length}/{MAX_MESSAGE_CHARS}
            </span>
          )}
          <button
            type="submit"
            data-testid="send-button"
            disabled={!canSend}
            className="group flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-ink transition-all duration-500 ease-spring hover:bg-white/90 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/35"
          >
            Send
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-spring group-hover:-translate-y-px group-hover:scale-105 group-disabled:translate-y-0 group-disabled:scale-100">
              <ArrowUp size={14} weight="light" />
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
