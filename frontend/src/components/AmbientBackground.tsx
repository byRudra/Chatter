/** Two slow light sources: emerald for live inference, violet for the cache. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute -left-[20%] -top-[25%] h-[70vmax] w-[70vmax] animate-drift rounded-full opacity-[0.22]"
        style={{
          background: "radial-gradient(closest-side, rgb(52 211 153 / 0.55), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-[30%] -right-[15%] h-[75vmax] w-[75vmax] animate-drift-slow rounded-full opacity-[0.2]"
        style={{
          background: "radial-gradient(closest-side, rgb(167 139 250 / 0.55), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050505_100%)]" />
    </div>
  );
}
