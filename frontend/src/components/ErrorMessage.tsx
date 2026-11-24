import { ArrowsClockwise, CloudSlash, WarningCircle, WifiSlash } from "@phosphor-icons/react";

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
      tone: "warn" as const,
      title: "All providers are unavailable right now",
      body: "Every API key in the pool failed for this request, so nothing was added to the conversation.",
    };
  }
  if (status === 422) {
    return {
      Icon: WarningCircle,
      tone: "danger" as const,
      title: "That message couldn't be sent",
      body: "The server rejected the request.",
    };
  }
  if (status === 0) {
    return {
      Icon: WifiSlash,
      tone: "danger" as const,
      title: "Can't reach the server",
      body: "If it was idle it may be waking up. Give it a few seconds and retry.",
    };
  }
  return {
    Icon: WarningCircle,
    tone: "danger" as const,
    title: `Something went wrong (${status})`,
    body: "The request didn't complete.",
  };
}

const TONES = {
  warn: { ring: "ring-warn/20", icon: "bg-warn/10 text-warn", glow: "from-warn/[0.07]" },
  danger: { ring: "ring-danger/20", icon: "bg-danger/10 text-danger", glow: "from-danger/[0.07]" },
};

export function ErrorMessage({ status, detail, onRetry, retryDisabled }: ErrorMessageProps) {
  const { Icon, tone, title, body } = describe(status);
  const styles = TONES[tone];

  return (
    <div role="alert" className={`bezel max-w-[44rem] ring-1 ${styles.ring}`}>
      <div
        className={`bezel-core flex flex-col gap-4 bg-gradient-to-br ${styles.glow} to-transparent px-5 py-4 sm:flex-row sm:items-start sm:px-6 sm:py-5`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
        >
          <Icon size={18} weight="light" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-white">{title}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-white/55">{body}</p>
          <p className="mt-2 break-words font-mono text-[11px] text-white/35">
            {status > 0 ? `HTTP ${status} · ` : ""}
            {detail}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          disabled={retryDisabled}
          className="group flex shrink-0 items-center gap-2 self-start rounded-full bg-white/[0.06] py-1.5 pl-4 pr-1.5 text-[13px] text-white/85 ring-1 ring-white/[0.08] transition-all duration-500 ease-spring hover:bg-white/[0.1] active:scale-[0.98] disabled:opacity-40"
        >
          Retry
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] transition-transform duration-700 ease-spring group-hover:rotate-180">
            <ArrowsClockwise size={13} weight="light" />
          </span>
        </button>
      </div>
    </div>
  );
}
