export function Intro({ sessionId }: { sessionId: string }) {
  return (
    <div className="pb-2 pt-4">
      <span className="eyebrow">
        Session <span className="normal-case tracking-normal text-white/80">{sessionId}</span>
      </span>
      <h1 className="mt-6 text-[2.75rem] font-medium leading-[1.02] tracking-[-0.035em] text-white xl:text-6xl">
        Every reply,
        <br />
        <span className="bg-gradient-to-r from-live via-white/90 to-cache bg-clip-text text-transparent">
          accounted for.
        </span>
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/50">
        Each message runs through a pool of API keys with automatic failover and a response cache,
        and every answer shows exactly how it was served.
      </p>
    </div>
  );
}
