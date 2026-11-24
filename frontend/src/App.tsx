import { AmbientBackground } from "./components/AmbientBackground";

export default function App() {
  return (
    <div className="grain relative min-h-[100dvh] bg-ink">
      <AmbientBackground />
      <main className="relative z-10 grid min-h-[100dvh] place-items-center">
        <span className="eyebrow">Chatter</span>
      </main>
    </div>
  );
}
