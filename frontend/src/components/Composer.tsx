import { ArrowUp } from "@phosphor-icons/react";
import { type FormEvent, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";

export const MAX_MESSAGE_CHARS = 4000;

interface ComposerProps {
  onSend: (message: string) => void;
  busy: boolean;
  /** Extra controls rendered in the footer row, e.g. an armed failure simulation. */
  footer?: ReactNode;
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
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
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
    <form
      onSubmit={submit}
      className="surface transition-colors duration-300 ease-out focus-within:border-white/[0.14]"
    >
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
        placeholder="Message chatter…"
        className="block max-h-[220px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[15px] leading-7 text-bone-100 placeholder:text-bone-600 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center gap-3 px-3 pb-3 pl-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {footer ?? (
            <span className="hidden font-mono text-[11px] text-bone-500 sm:inline">
              Enter to send, Shift+Enter for a new line
            </span>
          )}
        </div>
        {nearLimit && (
          <span
            className={`font-mono text-[11px] ${overLimit ? "text-coral-400" : "text-flare-400"}`}
            aria-live="polite"
          >
            {length}/{MAX_MESSAGE_CHARS}
          </span>
        )}
        <button
          type="submit"
          data-testid="send-button"
          aria-label="Send message"
          disabled={!canSend}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bone-100 text-bone-900 transition-all duration-300 ease-out hover:bg-white active:scale-[0.94] disabled:bg-bone-800 disabled:text-bone-600"
        >
          <ArrowUp size={16} weight="bold" />
        </button>
      </div>
    </form>
  );
}
