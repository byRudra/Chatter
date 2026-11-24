import { useState } from "react";
import { AmbientBackground } from "./components/AmbientBackground";
import { Composer } from "./components/Composer";
import { Conversation } from "./components/Conversation";
import { IslandHeader } from "./components/IslandHeader";
import { Intro } from "./components/Intro";
import { SystemPromptCard } from "./components/SystemPromptCard";
import { useChat } from "./hooks/useChat";

export default function App() {
  const chat = useChat();
  const [menuOpen, setMenuOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");

  const send = (text: string) => void chat.send(text, { systemPrompt });

  return (
    <div className="grain relative min-h-[100dvh] bg-ink text-white">
      <AmbientBackground />
      <IslandHeader
        connection="checking"
        onNewChat={chat.reset}
        newChatDisabled={chat.pending}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />

      <div className="relative z-10 mx-auto grid h-[100dvh] max-w-[1440px] gap-8 px-4 pb-4 pt-24 md:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pb-8 lg:pt-28">
        <aside className="hidden min-h-0 flex-col gap-5 overflow-y-auto pb-2 lg:flex">
          <Intro sessionId={chat.sessionId} />
          <SystemPromptCard value={systemPrompt} onChange={setSystemPrompt} />
        </aside>

        <section className="flex min-h-0 flex-col" aria-label="Conversation">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <Conversation
              turns={chat.turns}
              pending={chat.pending}
              onPickSuggestion={send}
              onRetry={send}
            />
          </div>
          <div className="pt-3">
            <Composer busy={chat.pending} onSend={send} />
          </div>
        </section>
      </div>
    </div>
  );
}
