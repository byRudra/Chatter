import { List, NotePencil } from "@phosphor-icons/react";
import { StatusDot, type ConnectionState } from "./StatusDot";

interface TopBarProps {
  sessionId: string;
  connection: ConnectionState;
  onNewChat: () => void;
  newChatDisabled?: boolean;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

export function TopBar({
  sessionId,
  connection,
  onNewChat,
  newChatDisabled,
  menuOpen,
  onOpenMenu,
}: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open panel"
        aria-expanded={menuOpen}
        aria-controls="side-panel"
        className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-bone-400 hover:bg-bone-900 hover:text-bone-100 lg:hidden"
      >
        <List size={18} />
      </button>

      <div className="flex min-w-0 items-center gap-2.5">
        <span className="lg:hidden">
          <StatusDot state={connection} />
        </span>
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-bone-100">Conversation</h2>
        <span className="truncate font-mono text-[11.5px] text-bone-500">{sessionId}</span>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        disabled={newChatDisabled}
        aria-label="New chat"
        className="ml-auto inline-flex min-h-[2.75rem] min-w-[2.75rem] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/[0.08] px-3 py-1.5 lg:min-h-0 text-[13px] text-bone-300 transition-colors duration-300 ease-out hover:border-white/[0.16] hover:text-bone-50 active:scale-[0.98] disabled:opacity-40"
      >
        <NotePencil size={15} />
        <span className="hidden sm:inline">New chat</span>
      </button>
    </header>
  );
}
