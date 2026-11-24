import { useEffect, useState } from "react";
import { Composer } from "./components/Composer";
import { Conversation } from "./components/Conversation";
import { ArmedBadge, FailureLab } from "./components/FailureLab";
import { GatewayStatus } from "./components/GatewayStatus";
import { Sidebar } from "./components/Sidebar";
import { SystemPromptCard } from "./components/SystemPromptCard";
import { TopBar } from "./components/TopBar";
import { useChat } from "./hooks/useChat";
import { useHealth } from "./hooks/useHealth";

export default function App() {
  const chat = useChat();
  const { connection, health } = useHealth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [armedFailure, setArmedFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const send = (text: string, simulate?: string) =>
    void chat.send(text, { systemPrompt, simulate });

  // An armed failure scenario applies to exactly one message.
  const sendFromComposer = (text: string) => {
    send(text, armedFailure ?? undefined);
    setArmedFailure(null);
  };

  const armFailure = (header: string | null) => {
    setArmedFailure(header);
    if (header) setMenuOpen(false);
  };

  return (
    <div className="flex h-[100dvh] bg-canvas text-bone-100">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sections={[
          <GatewayStatus key="gateway" connection={connection} health={health} turns={chat.turns} />,
          <SystemPromptCard key="prompt" value={systemPrompt} onChange={setSystemPrompt} />,
          <FailureLab
            key="lab"
            armed={armedFailure}
            onArm={armFailure}
            enabledOnServer={health?.failure_simulation ?? null}
          />,
        ]}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        <div aria-hidden className="dot-grid pointer-events-none absolute inset-0" />
        <TopBar
          sessionId={chat.sessionId}
          connection={connection}
          onNewChat={chat.reset}
          newChatDisabled={chat.pending}
          menuOpen={menuOpen}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-[46rem] flex-col px-4 sm:px-6">
            <Conversation
              turns={chat.turns}
              pending={chat.pending}
              onPickSuggestion={sendFromComposer}
              onRetry={(text) => send(text)}
            />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[46rem] px-4 pb-4 sm:px-6 sm:pb-6">
          <Composer
            busy={chat.pending}
            onSend={sendFromComposer}
            footer={
              armedFailure ? (
                <ArmedBadge header={armedFailure} onClear={() => setArmedFailure(null)} />
              ) : undefined
            }
          />
          <p className="mt-2 hidden text-center font-mono text-[10.5px] text-bone-500 sm:block">
            Cached by model and full conversation. Keys fail over in pool order.
          </p>
        </div>
      </main>
    </div>
  );
}
