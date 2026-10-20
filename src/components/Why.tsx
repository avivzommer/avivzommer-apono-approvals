import type { RationaleId } from "../rationale";

import { createContext, useContext } from "react";

import { rationale } from "../rationale";

export const RationaleContext = createContext(false);

const order = Object.keys(rationale) as RationaleId[];

/** A numbered pin that explains a design decision when "Show rationale" is on. */
export function Why({ id, align = "left" }: { id: RationaleId; align?: "left" | "right" }) {
  const on = useContext(RationaleContext);

  if (!on) return null;
  const note = rationale[id];

  return (
    <span className="group relative inline-flex align-middle">
      <button
        aria-label={`Rationale: ${note.title}`}
        className="grid size-5 shrink-0 cursor-help place-items-center rounded-full bg-[#7c3aed] text-[11px] font-bold text-white ring-2 ring-[#7c3aed]/25"
        type="button"
      >
        {order.indexOf(id) + 1}
      </button>
      <span
        className={`pointer-events-none absolute top-6 z-50 hidden w-72 rounded-lg bg-[#1e1e1e] p-3 text-left text-xs leading-relaxed font-normal text-white shadow-xl group-focus-within:block group-hover:block ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        <span className="block text-[13px] font-semibold">{note.title}</span>
        <span className="mt-1 block text-[#c4b5fd]">{note.principle}</span>
        <span className="mt-1 block text-white/70">{note.source}</span>
      </span>
    </span>
  );
}
