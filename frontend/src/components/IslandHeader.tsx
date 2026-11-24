import { Plus } from "@phosphor-icons/react";
import { Logo } from "./Logo";

export type ConnectionState = "checking" | "online" | "offline";

const CONNECTION_COPY: Record<ConnectionState, { label: string; dot: string }> = {
  checking: { label: "Connecting", dot: "bg-warn" },
  online: { label: "Online", dot: "bg-live" },
  offline: { label: "Offline", dot: "bg-danger" },
};

interface IslandHeaderProps {
  connection: ConnectionState;
  onNewChat: () => void;
  newChatDisabled?: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
}

export function IslandHeader({
  connection,
  onNewChat,
  newChatDisabled,
  menuOpen,
  onToggleMenu,
}: IslandHeaderProps) {
  const status = CONNECTION_COPY[connection];
  return (
    <header
      className="fixed inset-x-0 z-40 flex justify-center px-4"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
    >
      <nav className="flex w-full max-w-xl items-center gap-2 rounded-full bg-ink-900/70 p-1.5 pl-5 shadow-[0_16px_40px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/[0.08] backdrop-blur-2xl">
        <Logo />

        <span className="ml-auto hidden items-center gap-2 font-mono text-[11px] text-white/45 sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            {connection === "online" && (
              <span className={`absolute inset-0 animate-ping-soft rounded-full ${status.dot}`} />
            )}
            <span className={`relative h-1.5 w-1.5 rounded-full ${status.dot}`} />
          </span>
          {status.label}
        </span>

        <button
          type="button"
          onClick={onNewChat}
          disabled={newChatDisabled}
          className="group ml-auto flex items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-white/85 ring-1 ring-white/[0.08] transition-all duration-500 ease-spring hover:bg-white/[0.1] active:scale-[0.98] disabled:opacity-40 sm:ml-2"
        >
          New chat
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] transition-transform duration-500 ease-spring group-hover:rotate-90 group-hover:scale-105">
            <Plus size={14} weight="light" />
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={menuOpen ? "Close panel" : "Open panel"}
          aria-expanded={menuOpen}
          aria-controls="side-panel"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] transition-colors duration-500 ease-spring hover:bg-white/[0.1] lg:hidden"
        >
          <span
            className={`absolute h-px w-4 bg-white transition-transform duration-500 ease-spring ${
              menuOpen ? "rotate-45" : "-translate-y-[3px]"
            }`}
          />
          <span
            className={`absolute h-px w-4 bg-white transition-transform duration-500 ease-spring ${
              menuOpen ? "-rotate-45" : "translate-y-[3px]"
            }`}
          />
        </button>
      </nav>
    </header>
  );
}
