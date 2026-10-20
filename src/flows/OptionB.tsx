import type { AccessRequest, Level, Scenario } from "../data";
import type { DecisionRecord, Grant } from "../decisions";

import { ArrowDown, ArrowLeft, ArrowShapeTurnUpLeft, Check, Comment, ListCheck, Ticket, Xmark } from "@gravity-ui/icons";
import { Button } from "@heroui/react";
import { useState } from "react";

import { AskInfoModal, HighRiskAckModal, SendBackModal } from "../components/DecisionModals";
import { FlagCard } from "../components/Flag";
import { Why } from "../components/Why";
import { first, itemFlag, itemVerb, lowerLevel, mainResource, resourcePhrase } from "../plain";
import { EnvChip, LevelChip, PageHeader, RequesterCell, ResourceIcon, RiskBadge, RiskCallout, StatPill, TableHead, UserAvatar, WaitChip } from "../components/Ui";
import { DoneList } from "./OptionA";
import { levelLabel, requestRisk, resourceRisk } from "../risk";

type Choice = "approve" | "lower" | "deny";

/**
 * Option B · Per-resource review. Unit of work: each item in a request.
 * Story: "Open a request, decide each item: approve, lower it, or deny. Then send."
 */
export function OptionB({
  scenario,
  decided,
  asked,
  initialOpen,
  onDecide,
  onAsk,
  onSendBack,
}: {
  scenario: Scenario;
  decided: Record<string, DecisionRecord>;
  asked: Record<string, string>;
  initialOpen?: string;
  onDecide: (req: AccessRequest, granted: Grant[], denied: Grant[], reason?: string) => void;
  onAsk: (req: AccessRequest, question: string) => void;
  onSendBack: (req: AccessRequest, message: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(initialOpen ?? null);
  const current = scenario.requests.find((r) => r.id === openId && !decided[r.id]);

  if (current) return <ItemReview key={current.id} req={current} onAsk={onAsk} onSendBack={onSendBack} onBack={() => setOpenId(null)} onDecide={(...a) => (onDecide(...a), setOpenId(null))} />;

  const order = { high: 0, medium: 1, low: 2 } as const;
  const pending = scenario.requests.filter((r) => !decided[r.id]).sort((a, b) => a.expiresInMin - b.expiresInMin || order[requestRisk(a)] - order[requestRisk(b)]);
  const done = scenario.requests.filter((r) => decided[r.id]);

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-8 p-4 sm:p-8">
      <PageHeader
        actions={<StatPill icon={<ListCheck className="size-3.5 text-muted" />}>{pending.length} open</StatPill>}
        subtitle="Open a request and decide each item"
        title="Approvals"
      />

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <TableHead
          cols={[
            { label: "Requester", className: "w-56 shrink-0" },
            { label: "Riskiest item", className: "flex-1" },
            { label: "Items", className: "w-14 shrink-0 text-right" },
            { label: "Risk", className: "w-28 shrink-0" },
            { label: "Waiting", className: "w-24 shrink-0 text-right" },
          ]}
        />
        <ul className="divide-y divide-border">
          {pending.map((req) => {
            const main = mainResource(req);
            return (
              <li key={req.id}>
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-default/50" type="button" onClick={() => setOpenId(req.id)}>
                  <span className="w-40 shrink-0 sm:w-56">
                    <RequesterCell req={req} size="sm" />
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                    <ResourceIcon res={main} size="sm" />
                    <span className="truncate">{main.name}</span>
                    <span className="hidden sm:inline">
                      <LevelChip level={main.level} />
                    </span>
                    {asked[req.id] ? <span className="text-xs text-accent">question sent</span> : null}
                  </span>
                  <span className="hidden w-14 shrink-0 text-right text-sm text-muted tabular sm:block">{req.resources.length}</span>
                  <span className="hidden w-28 shrink-0 sm:block">
                    <RiskBadge risk={requestRisk(req)} />
                  </span>
                  <span className="w-24 shrink-0 text-right">
                    <WaitChip req={req} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {done.length ? <DoneList decided={decided} done={done} /> : null}
    </div>
  );
}

function ItemReview({
  req,
  onBack,
  onDecide,
  onAsk,
  onSendBack,
}: {
  req: AccessRequest;
  onBack: () => void;
  onDecide: (req: AccessRequest, granted: Grant[], denied: Grant[], reason?: string) => void;
  onAsk: (req: AccessRequest, question: string) => void;
  onSendBack: (req: AccessRequest, message: string) => void;
}) {
  const name = first(req);
  const order = { high: 0, medium: 1, low: 2 } as const;
  // The riskiest item gets the one red flag; others get a neutral note.
  const topId = mainResource(req).id;
  const items = [...req.resources].sort((a, b) => (a.id === topId ? -1 : b.id === topId ? 1 : order[resourceRisk(a)] - order[resourceRisk(b)]));
  // Routine items start approved; risky items start undecided, so they need a deliberate choice.
  const [choice, setChoice] = useState<Record<string, Choice | undefined>>(
    Object.fromEntries(items.map((r) => [r.id, resourceRisk(r) === "low" ? "approve" : undefined])),
  );
  const [modal, setModal] = useState<null | "ack" | "ask" | "sendBack">(null);

  const finalLevel = (id: string, level: Level): Level | null =>
    choice[id] === "approve" ? level : choice[id] === "lower" ? lowerLevel[level] : null;
  const granted: Grant[] = items.flatMap((r) => {
    const l = finalLevel(r.id, r.level);
    return l ? [{ resource: r.name, level: l, env: r.env }] : [];
  });
  const denied: Grant[] = items.filter((r) => choice[r.id] === "deny").map((r) => ({ resource: r.name, level: r.level, env: r.env }));
  const undecided = items.filter((r) => !choice[r.id]).length;
  const lowered = items.filter((r) => choice[r.id] === "lower");
  const highGranted = items.filter((r) => choice[r.id] === "approve" && resourceRisk(r) === "high");

  const send = () => (highGranted.length ? setModal("ack") : onDecide(req, granted, denied));

  return (
    <div className="mx-auto flex min-h-full max-w-[760px] flex-col gap-6 px-4 pt-4 sm:px-8 sm:pt-8">
      <button className="flex items-center gap-1 text-sm text-muted hover:text-foreground" type="button" onClick={onBack}>
        <ArrowLeft className="size-4" /> All requests
      </button>

      <header className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center">
        <UserAvatar initials={req.requester.initials} name={req.requester.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold">
            {req.requester.name} asks for {items.length} item{items.length > 1 ? "s" : ""} for {req.durationH} hours
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="flex items-start gap-1.5">
              <Comment className="mt-0.5 size-3.5 shrink-0" /> "{req.justification}"
            </span>
            <span
              className={`inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs ${
                req.ticket ? "border-border" : "border-dashed border-border"
              }`}
            >
              <Ticket className="size-3.5" /> {req.ticket ? `${req.ticket.severity ? `${req.ticket.severity} · ` : ""}${req.ticket.id}` : "No ticket"}
            </span>
          </div>
        </div>
        <WaitChip req={req} />
      </header>

      <FlagCard req={req} />

      <section className="flex flex-col gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted">
          Decide each item <Why id="tiers" />
        </h2>
        {items.map((r) => {
          const f = itemFlag(r, name);
          const lower = lowerLevel[r.level];
          const c = choice[r.id];
          return (
            <article key={r.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-3">
                <ResourceIcon res={r} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px]">
                    <b>{itemVerb(r)}</b> {resourcePhrase(r)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <LevelChip level={r.level} />
                    <EnvChip env={r.env} />
                  </div>
                </div>
                {c === undefined ? <span className="text-xs font-medium whitespace-nowrap text-muted">Choose one</span> : null}
              </div>
              {f ? (
                <div className="ms-11">
                  <RiskCallout main={f.main} size="sm" tone="neutral" />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 ps-11" role="group" aria-label={`Decision for ${r.name}`}>
                <Choice active={c === "approve"} onPress={() => setChoice((s) => ({ ...s, [r.id]: "approve" }))}>
                  <Check className="size-3.5" /> Approve {levelLabel[r.level]}
                </Choice>
                {lower ? (
                  <Choice active={c === "lower"} onPress={() => setChoice((s) => ({ ...s, [r.id]: "lower" }))}>
                    <ArrowDown className="size-3.5" /> Lower to {levelLabel[lower]}
                  </Choice>
                ) : null}
                <Choice active={c === "deny"} danger onPress={() => setChoice((s) => ({ ...s, [r.id]: "deny" }))}>
                  <Xmark className="size-3.5" /> Deny
                </Choice>
              </div>
            </article>
          );
        })}
      </section>

      {/* Sticky summary: what you're about to give, in one line */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-auto border-t border-border bg-surface/95 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] backdrop-blur sm:-mx-8">
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-8">
          <p className="flex-1 text-sm">
            {undecided ? (
              <span className="text-muted">
                Choose for {undecided} item{undecided > 1 ? "s" : ""} to continue
              </span>
            ) : (
              <>
                <b>
                  Giving {granted.length} of {items.length}
                </b>
                {lowered.length ? <span className="text-muted"> · {lowered.map((r) => `${r.name} lowered to ${levelLabel[lowerLevel[r.level]!]}`).join(", ")}</span> : null}
                {denied.length ? <span className="text-muted"> · {denied.length} denied</span> : null}
              </>
            )}{" "}
            <Why id="stage" />
          </p>
          <div className="flex gap-2">
            {req.mistake ? (
              <Button variant="secondary" onPress={() => setModal("sendBack")}>
                <ArrowShapeTurnUpLeft className="size-4" /> Send back to fix
              </Button>
            ) : (
              <Button variant="tertiary" onPress={() => setModal("ask")}>
                Ask {name}
              </Button>
            )}
            <Button className="flex-1 sm:flex-none" isDisabled={undecided > 0} onPress={send}>
              Send decision
            </Button>
          </div>
        </div>
      </div>

      <HighRiskAckModal
        isOpen={modal === "ack"}
        req={{ ...req, resources: highGranted }}
        onConfirm={(reason) => {
          setModal(null);
          onDecide(req, granted, denied, reason);
        }}
        onOpenChange={(o) => setModal(o ? "ack" : null)}
      />
      <SendBackModal
        isOpen={modal === "sendBack"}
        req={req}
        onConfirm={(m) => {
          setModal(null);
          onSendBack(req, m);
          onBack();
        }}
        onOpenChange={(o) => setModal(o ? "sendBack" : null)}
      />
      <AskInfoModal
        isOpen={modal === "ask"}
        req={req}
        onConfirm={(q) => {
          setModal(null);
          onAsk(req, q);
          onBack();
        }}
        onOpenChange={(o) => setModal(o ? "ask" : null)}
      />
    </div>
  );
}

function Choice({ active, danger, onPress, children }: { active: boolean; danger?: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Button
      aria-pressed={active}
      size="sm"
      variant={active ? (danger ? "danger-soft" : "primary") : "tertiary"}
      onPress={onPress}
    >
      {children}
    </Button>
  );
}
