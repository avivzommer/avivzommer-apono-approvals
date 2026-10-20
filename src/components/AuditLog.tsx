import type { DecisionRecord } from "../decisions";

import { ArrowShapeTurnUpLeft, CircleCheck, CircleXmark, Comment, Eye, FileText, Lock } from "@gravity-ui/icons";

import { approver } from "../data";
import { optionMeta } from "../decisions";
import { levelLabel } from "../risk";
import { PageHeader, RiskBadge, StatPill } from "./Ui";
import { Why } from "./Why";

/** The admin's view (Ron): immutable records that include what the approver was shown. */
export function AuditLog({ records }: { records: DecisionRecord[] }) {
  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-6 p-4 sm:p-8">
      <PageHeader
        actions={
          <StatPill icon={<Lock className="size-3.5 text-muted" />}>
            {records.length} record{records.length === 1 ? "" : "s"} · write-once
          </StatPill>
        }
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            What an admin or auditor sees: who decided, what was granted, why, and what the approver saw. <Why id="audit" />
          </span>
        }
        title="Activity"
      />

      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-12 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-default text-muted">
            <FileText className="size-5" />
          </span>
          <p className="text-sm font-medium">No decisions yet</p>
          <p className="text-xs text-muted">Approve or reject something in the portal and the record appears here.</p>
        </div>
      ) : (
        <ol className="relative flex flex-col gap-3 before:absolute before:inset-y-2 before:start-[15px] before:w-px before:bg-border">
          {[...records].reverse().map((rec) => {
            const tone = outcomeTone[rec.outcome];
            return (
              <li key={rec.id} className="relative flex gap-4">
                <span className={`z-10 mt-4 grid size-8 shrink-0 place-items-center rounded-full ring-4 ring-surface ${tone.dot}`}>
                  <tone.Icon className="size-4" />
                </span>
                <article className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">{rec.requester}</span>
                    <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ${tone.chip}`}>{rec.outcome}</span>
                    <RiskBadge risk={rec.risk} />
                    {rec.isTrap ? (
                      <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2 text-xs font-semibold text-background">Test trap item</span>
                    ) : null}
                    <span className="ms-auto flex items-center gap-1 text-xs text-muted tabular">
                      <Lock className="size-3.5" /> {rec.id} · {rec.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Row k="Approver" v={approver.name} />
                      <Row k="Method" v={`${rec.method} · Option ${rec.option}: ${optionMeta[rec.option].name}`} />
                      <Row k="Reason" v={rec.reason ? `"${rec.reason}"` : "Not required (low risk)"} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {rec.granted.length ? (
                        <Row k="Granted" v={rec.granted.map((g) => `${levelLabel[g.level]} · ${g.resource} (${g.env})`).join(", ") + ` · ${rec.durationH}h`} />
                      ) : null}
                      {rec.denied.length ? <Row k="Denied" v={rec.denied.map((g) => `${levelLabel[g.level]} · ${g.resource} (${g.env})`).join(", ")} /> : null}
                    </div>
                  </div>
                  <div className="rounded-lg bg-default/50 px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-muted">
                      <Eye className="size-3.5" /> Shown to the approver at decision time
                    </span>
                    <span className="mt-1 block text-foreground/80">{rec.shown.length ? rec.shown.join(" · ") : "No risk flags (routine)"}</span>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

const outcomeTone = {
  approved: { dot: "bg-success/15 text-success", chip: "bg-success/10 text-success", Icon: CircleCheck },
  "partially approved": { dot: "bg-warning/20 text-[#b45309]", chip: "bg-warning/10 text-[#b45309]", Icon: CircleCheck },
  rejected: { dot: "bg-danger/15 text-danger", chip: "bg-danger/10 text-danger", Icon: CircleXmark },
  "info requested": { dot: "bg-accent/15 text-accent", chip: "bg-accent/10 text-accent", Icon: Comment },
  "sent back to fix": { dot: "bg-accent/15 text-accent", chip: "bg-accent/10 text-accent", Icon: ArrowShapeTurnUpLeft },
} as const;

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-2">
      <span className="text-muted">{k}</span>
      <span>{v}</span>
    </div>
  );
}
