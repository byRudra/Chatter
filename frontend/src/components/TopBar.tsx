import { List, NotePencil } from "@phosphor-icons/react";
import type { Theme } from "../hooks/useTheme";
import { StatusDot, type ConnectionState } from "./StatusDot";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  sessionId: string;
  connection: ConnectionState;
  onNewChat: () => void;
  newChatDisabled?: boolean;
  menuOpen: boolean;
  onOpenMenu: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function TopBar({
  sessionId,
  connection,
  onNewChat,
  newChatDisabled,
  menuOpen,
  onOpenMenu,
  theme,
  onToggleTheme,
}: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-900/[0.06] px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open panel"
        aria-expanded={menuOpen}
        aria-controls="side-panel"
        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900 lg:hidden"
      >
        <List size={18} />
      </button>

      <div className="flex min-w-0 items-center gap-2.5">
        <span className="lg:hidden">
          <StatusDot state={connection} />
        </span>
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
          Conversation
        </h2>
        <span className="truncate font-mono text-[11.5px] text-ink-500">{sessionId}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          type="button"
          onClick={onNewChat}
          disabled={newChatDisabled}
          aria-label="New chat"
          className="inline-flex h-11 min-w-[2.75rem] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-ink-900/[0.08] px-3 text-[13px] text-ink-700 transition-colors duration-300 ease-out hover:border-ink-900/[0.16] hover:text-ink-950 active:scale-[0.98] disabled:opacity-40 lg:h-9"
        >
          <NotePencil size={15} />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>
    </header>
  );
}
