import type { AccessRequest } from "../data";
import type { Tier } from "../plain";

import { ArrowRight, CircleCheck, CircleInfo, CircleXmark, TriangleExclamation } from "@gravity-ui/icons";

import { explain, first } from "../plain";

/*
 * Flag mechanism: "compared to normal".
 * Quiet when a request matches what the team normally gets; when it doesn't,
 * the difference is the flag, said in one plain sentence. Four tiers, one color each:
 *   normal (quiet gray) · unusual (amber) · looks like a mistake (blue) · not allowed (red)
 */

const tierStyle: Record<Tier, { chip: string; Icon: typeof CircleCheck }> = {
  normal: { chip: "border-border bg-surface text-muted", Icon: CircleCheck },
  unusual: { chip: "border-warning/40 bg-warning/10 text-[#b45309]", Icon: TriangleExclamation },
  mistake: { chip: "border-accent/30 bg-accent/10 text-accent", Icon: CircleInfo },
  notAllowed: { chip: "border-danger/30 bg-danger/10 text-danger", Icon: CircleXmark },
};

export function TierChip({ tier, label }: { tier: Tier; label: string }) {
  const { chip, Icon } = tierStyle[tier];
  return (
    <span className={`inline-flex h-6 w-fit items-center gap-1 rounded-full border px-2 text-xs font-semibold whitespace-nowrap ${chip}`}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

/** Compact flag for lists and cards: tier + one plain sentence. */
export function FlagLine({ req }: { req: AccessRequest }) {
  const e = explain(req);
  if (e.tier === "normal") return null;
  return (
    <div className="flex flex-col gap-1.5">
      <TierChip label={e.label} tier={e.tier} />
      <p className="text-sm font-medium text-foreground">{e.title}</p>
    </div>
  );
}

/** Full flag for the decision view: what's different, why it matters, usual vs. asked, what to do instead. */
export function FlagCard({ req }: { req: AccessRequest }) {
  const e = explain(req);
  const name = first(req);

  if (e.tier === "normal") {
    return (
      <section className="flex gap-3 rounded-xl border border-border bg-default/40 p-4">
        <CircleCheck className="mt-0.5 size-4 shrink-0 text-muted" />
        <div>
          <h3 className="text-sm font-semibold">Normal for your team</h3>
          <p className="mt-1 text-sm text-muted">{e.title}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <TierChip label={e.label} tier={e.tier} />
      <div>
        <p className="text-[15px] font-semibold leading-snug">{e.title}</p>
        <p className="mt-1 text-sm text-foreground/75">{e.why}</p>
      </div>

      {e.compare ? (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-default/60 px-3 py-2">
            <div className="text-[11px] font-medium tracking-wide text-muted uppercase">Usual for your team</div>
            <div className="mt-0.5 font-medium">{e.compare.usual}</div>
          </div>
          <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
            <div className="text-[11px] font-medium tracking-wide text-[#b45309] uppercase">This request</div>
            <div className="mt-0.5 font-semibold text-[#92400e]">{e.compare.asked}</div>
          </div>
        </div>
      ) : null}

      {e.facts.length ? <p className="text-xs text-muted">{e.facts.join(" · ")}</p> : null}

      {e.instead ? (
        <div className="flex items-start gap-2 rounded-lg bg-default/60 px-3 py-2 text-sm">
          <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted" />
          <span>
            <span className="font-medium">What {name} can do instead: </span>
            {e.instead}
          </span>
        </div>
      ) : null}
    </section>
  );
}
