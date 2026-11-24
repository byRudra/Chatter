import { useEffect, useState } from "react";
import { AmbientBackground } from "./components/AmbientBackground";
import { Composer } from "./components/Composer";
import { Conversation } from "./components/Conversation";
import { ArmedBadge, FailureLab } from "./components/FailureLab";
import { GatewayCard } from "./components/GatewayCard";
import { IslandHeader } from "./components/IslandHeader";
import { Reveal } from "./components/Reveal";
import { Intro } from "./components/Intro";
import { SystemPromptCard } from "./components/SystemPromptCard";
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
    setMenuOpen(false);
  };

  return (
    <div className="grain relative min-h-[100dvh] bg-ink text-white">
      <AmbientBackground />
      <IslandHeader
        connection={connection}
        onNewChat={() => {
          chat.reset();
          setMenuOpen(false);
        }}
        newChatDisabled={chat.pending}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />

      <div className="relative z-10 mx-auto grid h-[100dvh] max-w-[1440px] gap-8 px-4 pb-4 pt-24 md:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pb-8 lg:pt-28">
        {/* One panel for every viewport: a column on desktop, a glass sheet on mobile. */}
        <aside
          id="side-panel"
          className={`fixed inset-0 z-30 flex flex-col gap-5 overflow-y-auto bg-ink/85 px-4 pb-10 pt-24 backdrop-blur-3xl transition-all duration-700 ease-spring md:px-8 lg:visible lg:static lg:inset-auto lg:z-auto lg:min-h-0 lg:translate-y-0 lg:bg-transparent lg:px-0 lg:pb-2 lg:pt-0 lg:opacity-100 lg:backdrop-blur-none ${
            menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-4 opacity-0"
          }`}
        >
          <Reveal>
            <Intro sessionId={chat.sessionId} />
          </Reveal>
          <Reveal delay={0.08}>
            <SystemPromptCard value={systemPrompt} onChange={setSystemPrompt} />
          </Reveal>
          <Reveal delay={0.16}>
            <GatewayCard connection={connection} health={health} turns={chat.turns} />
          </Reveal>
          <Reveal delay={0.24}>
            <FailureLab
              armed={armedFailure}
              onArm={setArmedFailure}
              enabledOnServer={health?.failure_simulation ?? null}
            />
          </Reveal>
        </aside>

        <section className="flex min-h-0 flex-col" aria-label="Conversation">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 [mask-image:linear-gradient(to_bottom,transparent,black_28px)]">
            <Conversation
              turns={chat.turns}
              pending={chat.pending}
              onPickSuggestion={sendFromComposer}
              onRetry={(text) => send(text)}
            />
          </div>
          <Reveal delay={0.12} className="pt-3">
            <Composer
              busy={chat.pending}
              onSend={sendFromComposer}
              footer={
                armedFailure && (
                  <ArmedBadge header={armedFailure} onClear={() => setArmedFailure(null)} />
                )
              }
            />
          </Reveal>
        </section>
      </div>
    </div>
  );
}
