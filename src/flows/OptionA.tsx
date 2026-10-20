import type { AccessRequest, Scenario } from "../data";
import type { DecisionRecord } from "../decisions";

import { ArrowRight, Check, CircleCheck, CircleXmark, Clock, ShieldExclamation } from "@gravity-ui/icons";
import { Button, Modal } from "@heroui/react";
import { useState } from "react";

import { EnvChip, LevelChip, PageHeader, RequesterCell, ResourceIcon, ResourceLine, SectionTitle, StatPill, TableHead, WaitChip } from "../components/Ui";
import { Why } from "../components/Why";
import { explain, headline, mainResource } from "../plain";
import { FlagLine } from "../components/Flag";
import { formatWait, requestRisk } from "../risk";

/**
 * Option A · Risk-lane inbox. Unit of work: the queue.
 * Story: "One request needs you. The rest are routine — check them once and approve together."
 */
export function OptionA({
  scenario,
  decided,
  asked,
  onOpen,
  onBatchApprove,
}: {
  scenario: Scenario;
  decided: Record<string, DecisionRecord>;
  asked: Record<string, string>;
  onOpen: (req: AccessRequest) => void;
  onBatchApprove: (reqs: AccessRequest[]) => void;
}) {
  const pending = scenario.requests.filter((r) => !decided[r.id]);
  const tierOrder = { notAllowed: 0, mistake: 1, unusual: 2, normal: 3 } as const;
  const attention = pending
    .filter((r) => requestRisk(r) !== "low")
    .sort((a, b) => Number(b.expiresInMin < 60) - Number(a.expiresInMin < 60) || tierOrder[explain(a).tier] - tierOrder[explain(b).tier] || a.expiresInMin - b.expiresInMin);
  const routine = pending.filter((r) => requestRisk(r) === "low" && !asked[r.id]);
  const done = scenario.requests.filter((r) => decided[r.id]);
  const oldest = pending.length ? Math.max(...pending.map((r) => r.waitingMin)) : 0;
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-8 p-4 sm:p-8">
      <PageHeader
        actions={
          <>
            {attention.length ? (
              <StatPill icon={<ShieldExclamation className="size-3.5 text-muted" />}>
                {attention.length} need{attention.length === 1 ? "s" : ""} review
              </StatPill>
            ) : null}
            <StatPill icon={<CircleCheck className="size-3.5 text-muted" />}>{routine.length} routine</StatPill>
            {pending.length ? (
              <StatPill icon={<Clock className="size-3.5 text-muted" />}>
                Oldest {formatWait(oldest)} <Why id="urgency" align="right" />
              </StatPill>
            ) : null}
          </>
        }
        subtitle="Requests waiting for your decision"
        title="Approvals"
      />

      {attention.length ? (
        <section className="flex flex-col gap-3">
          <SectionTitle count={attention.length} icon={<ShieldExclamation className="size-4 text-muted" />}>
            Needs your review <Why id="lanes" />
          </SectionTitle>
          {attention.map((req) => {
            const h = headline(req);
            return (
              <article
                key={req.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <RequesterCell req={req} />
                    {req.ticket?.severity ? (
                      <span className="inline-flex h-6 items-center rounded-md border border-border px-1.5 text-xs font-medium text-foreground/80">
                        {req.ticket.severity} · {req.ticket.id}
                      </span>
                    ) : null}
                    <span className="ms-auto">
                      <WaitChip req={req} />
                    </span>
                  </div>
                  <p className="text-[15px] leading-snug">
                    Wants to <b>{h.verb}</b> {h.resource} for {h.duration}
                    {h.rest ? <span className="text-muted"> {h.rest}</span> : null}
                  </p>
                  <div className="rounded-lg bg-default/50 p-3">
                    <FlagLine req={req} />
                  </div>
                  {asked[req.id] ? <p className="text-sm text-accent">Question sent · waiting for an answer</p> : null}
                </div>
                <Button className="shrink-0" onPress={() => onOpen(req)}>
                  Review <ArrowRight className="size-4" />
                </Button>
              </article>
            );
          })}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <SectionTitle
          aside={<span className="hidden sm:inline">Read-only or non-production · your team already has this</span>}
          count={routine.length}
          icon={<CircleCheck className="size-4 text-muted" />}
        >
          Routine <Why id="routineReason" />
        </SectionTitle>
        {routine.length ? (
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <TableHead
              cols={[
                { label: "Requester", className: "w-56 shrink-0" },
                { label: "Access", className: "flex-1" },
                { label: "Environment", className: "w-28 shrink-0" },
                { label: "Waiting", className: "w-16 shrink-0 text-right" },
              ]}
            />
            <ul className="divide-y divide-border">
              {routine.map((req) => {
                const main = mainResource(req);
                return (
                  <li key={req.id}>
                    <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-default/50" type="button" onClick={() => onOpen(req)}>
                      <span className="w-40 shrink-0 sm:w-56">
                        <RequesterCell req={req} size="sm" />
                      </span>
                      <span className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                        <ResourceIcon res={main} size="sm" />
                        <span className="truncate">{main.name}</span>
                        <span className="hidden sm:inline">
                          <LevelChip level={main.level} />
                        </span>
                        {req.resources.length > 1 ? <span className="text-xs whitespace-nowrap text-muted">+{req.resources.length - 1}</span> : null}
                      </span>
                      <span className="hidden w-28 shrink-0 sm:block">
                        <EnvChip env={main.env} />
                      </span>
                      <span className="hidden w-16 shrink-0 text-right text-xs text-muted tabular sm:block">{formatWait(req.waitingMin)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center gap-3 border-t border-border bg-default/30 px-4 py-3">
              <span className="text-xs text-muted">
                You'll see the full list before it's sent. <Why id="stage" />
              </span>
              <Button className="ms-auto" onPress={() => setConfirmOpen(true)}>
                <Check className="size-4" /> Approve all {routine.length}
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {done.length ? <DoneList decided={decided} done={done} /> : null}

      <Modal.Backdrop isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[520px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-success/10 text-success">
                <Check className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Approve {routine.length} routine requests?</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3">
              <ul className="max-h-[45vh] divide-y divide-border overflow-auto rounded-xl border border-border text-sm">
                {routine.map((req) => (
                  <li key={req.id} className="flex items-center gap-3 px-3 py-2">
                    <RequesterCell req={req} size="sm" />
                    <span className="ms-auto">
                      <ResourceLine res={mainResource(req)} />
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted">None include production changes or full control. Access starts right away.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button
                onPress={() => {
                  setConfirmOpen(false);
                  onBatchApprove(routine);
                }}
              >
                Approve {routine.length}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-success/10 text-success">
        <Check className="size-5" />
      </span>
      <p className="text-sm font-medium">All caught up</p>
      <p className="text-xs text-muted">New requests will show up here and in your email.</p>
    </div>
  );
}

export function DoneList({ done, decided }: { done: AccessRequest[]; decided: Record<string, DecisionRecord> }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionTitle count={done.length}>Done today</SectionTitle>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {done.map((req) => {
          const rec = decided[req.id];
          const rejected = rec.outcome === "rejected";
          return (
            <li key={req.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <RequesterCell req={req} size="sm" />
              <span
                className={`ms-auto inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium ${
                  rejected
                    ? "bg-danger/10 text-danger"
                    : rec.outcome === "partially approved"
                      ? "bg-warning/10 text-[#b45309]"
                      : rec.outcome === "sent back to fix"
                        ? "bg-accent/10 text-accent"
                        : "bg-success/10 text-success"
                }`}
              >
                {rejected ? <CircleXmark className="size-3.5" /> : <CircleCheck className="size-3.5" />}
                {rec.outcome}
              </span>
              <span className="hidden text-xs text-muted tabular sm:inline">{rec.id}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
