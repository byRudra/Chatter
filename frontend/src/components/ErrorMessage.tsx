import { ArrowClockwise, CloudSlash, WarningCircle, WifiSlash } from "@phosphor-icons/react";

interface ErrorMessageProps {
  status: number;
  detail: string;
  onRetry: () => void;
  retryDisabled?: boolean;
}

function describe(status: number) {
  if (status === 503) {
    return {
      Icon: CloudSlash,
      border: "border-flare-400/50",
      tone: "text-flare-700",
      title: "All providers are unavailable",
      body: "Every API key in the pool failed for this request. Nothing was added to the conversation.",
    };
  }
  if (status === 422) {
    return {
      Icon: WarningCircle,
      border: "border-coral-400/50",
      tone: "text-coral-700",
      title: "That message couldn't be sent",
      body: "The server rejected the request.",
    };
  }
  if (status === 0) {
    return {
      Icon: WifiSlash,
      border: "border-coral-400/50",
      tone: "text-coral-700",
      title: "Can't reach the server",
      body: "If it was idle it may be waking up. Give it a few seconds and retry.",
    };
  }
  return {
    Icon: WarningCircle,
    border: "border-coral-400/50",
    tone: "text-coral-700",
    title: `Request failed (${status})`,
    body: "The request didn't complete.",
  };
}

export function ErrorMessage({ status, detail, onRetry, retryDisabled }: ErrorMessageProps) {
  const { Icon, border, tone, title, body } = describe(status);

  return (
    <div role="alert" className={`ml-[2.625rem] border-l-2 pl-4 ${border}`}>
      <p className={`flex items-center gap-2 text-[14px] font-medium ${tone}`}>
        <Icon size={16} />
        {title}
      </p>
      <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-ink-600">{body}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <span className="break-all font-mono text-[11.5px] text-ink-500">
          {status > 0 ? `HTTP ${status} / ` : ""}
          {detail}
        </span>
        <button
          type="button"
          onClick={onRetry}
          disabled={retryDisabled}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-ink-900/[0.08] px-2.5 py-1 text-[12.5px] text-ink-700 transition-colors duration-300 ease-out hover:border-ink-900/[0.16] hover:text-ink-950 active:scale-[0.98] disabled:opacity-40"
        >
          <ArrowClockwise
            size={13}
            className="transition-transform duration-500 ease-out group-hover:rotate-180"
          />
          Retry
        </button>
      </div>
    </div>
  );
}
