import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { API_BASE_URL } from "../api/client";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  sections: ReactNode[];
}

/**
 * The inspector. A static column on desktop, a slide-over drawer below lg. Rendered once
 * for every viewport so form controls (and their test ids) are never duplicated.
 */
export function Sidebar({ open, onClose, sections }: SidebarProps) {
  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity duration-500 ease-out lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="side-panel"
        className={`fixed inset-y-0 left-0 z-40 flex w-[88vw] max-w-[22rem] flex-col border-r border-ink-900/[0.06] bg-ink-50 transition-transform duration-500 ease-out lg:static lg:z-auto lg:w-[22rem] lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink-900/[0.06] px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-900 lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 divide-y divide-ink-900/[0.06] overflow-y-auto">
          {sections.map((section, i) => (
            <Reveal key={i} delay={0.05 * i} className="px-5 py-5">
              {section}
            </Reveal>
          ))}
        </div>

        <p
          className="shrink-0 truncate border-t border-ink-900/[0.06] px-5 py-3 font-mono text-[11px] text-ink-500"
          title={API_BASE_URL}
        >
          api {API_BASE_URL.replace(/^https?:\/\//, "")}
        </p>
      </aside>
    </>
  );
}
