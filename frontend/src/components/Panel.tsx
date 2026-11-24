import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface PanelProps {
  icon: Icon;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function Panel({ icon: IconComponent, title, aside, children }: PanelProps) {
  return (
    <section className="bezel">
      <div className="bezel-core px-5 py-4">
        <header className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] text-white/70 ring-1 ring-white/[0.06]">
            <IconComponent size={14} weight="light" />
          </span>
          <h2 className="text-[13px] font-medium tracking-tight text-white/85">{title}</h2>
          {aside && <div className="ml-auto">{aside}</div>}
        </header>
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}
