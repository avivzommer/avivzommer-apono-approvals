import type { AccessRequest, Scenario } from "../data";
import type { DecisionRecord } from "../decisions";

import { Sparkles, Xmark } from "@gravity-ui/icons";
import { Button, Modal } from "@heroui/react";
import { useState } from "react";

import { LevelChip, PageHeader, RequesterCell, ResourceIcon, ResourceLine, TableHead, WaitChip } from "../components/Ui";
import { Why } from "../components/Why";
import { mainResource } from "../plain";
import { DoneList, EmptyState } from "./OptionA";

/**
 * Option C · Recommendation-first (market default: Entra, SailPoint AI, C1 Copilot, Okta GA).
 * Story: "Apono already suggests a decision for each request. Accept the suggestions, look at the rest."
 */
export function OptionC({
  scenario,
  decided,
  asked,
  onOpen,
  onAccept,
}: {
  scenario: Scenario;
  decided: Record<string, DecisionRecord>;
  asked: Record<string, string>;
  onOpen: (req: AccessRequest) => void;
  onAccept: (reqs: AccessRequest[]) => void;
}) {
  const pending = scenario.requests.filter((r) => !decided[r.id]);
  /** Entra-style: every row carries its own suggestion (approve or deny); one click applies them all. */
  const recommended = pending.filter((r) => r.recommendation.verdict !== "review" && !asked[r.id]);
  const approveCount = recommended.filter((r) => r.recommendation.verdict === "approve").length;
  const denyCount = recommended.length - approveCount;
  const sorted = [...pending].sort((a, b) => (a.recommendation.verdict === "review" ? -1 : 0) - (b.recommendation.verdict === "review" ? -1 : 0));
  const done = scenario.requests.filter((r) => decided[r.id]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-8 p-4 sm:p-8">
      <PageHeader
        actions={
          recommended.length ? (
            <Button onPress={() => setConfirmOpen(true)}>
              <Sparkles className="size-4" /> Accept {recommended.length} recommendations
            </Button>
          ) : null
        }
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#7c3aed]" /> Apono recommends: approve {approveCount} · deny {denyCount}
          </span>
        }
        title="Approvals"
      />

      {pending.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <TableHead
            cols={[
              { label: "Requester", className: "w-52 shrink-0" },
              { label: "Access", className: "w-64 shrink-0" },
              { label: "Recommendation", className: "flex-1" },
              { label: "Waiting", className: "w-24 shrink-0 text-right" },
            ]}
          />
          <ul className="divide-y divide-border">
            {sorted.map((req) => {
              const main = mainResource(req);
              const verdict = req.recommendation.verdict;
              return (
                <li key={req.id}>
                  <button
                    className="flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-default/50 sm:flex-row sm:items-center sm:gap-3"
                    type="button"
                    onClick={() => onOpen(req)}
                  >
                    <span className="flex items-center justify-between gap-2 sm:w-52 sm:shrink-0">
                      <RequesterCell req={req} size="sm" />
                      <span className="sm:hidden">
                        <WaitChip req={req} />
                      </span>
                    </span>
                    <span className="flex min-w-0 items-center gap-2 text-sm sm:w-64 sm:shrink-0">
                      <ResourceIcon res={main} size="sm" />
                      <span className="truncate">{main.name}</span>
                      <LevelChip level={main.level} />
                      {req.resources.length > 1 ? <span className="text-xs text-muted">+{req.resources.length - 1}</span> : null}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <VerdictChip verdict={verdict} />
                      <span className="truncate text-xs text-muted">{req.recommendation.reason}</span>
                      {asked[req.id] ? <span className="text-xs text-accent">question sent</span> : null}
                    </span>
                    <span className="hidden w-24 shrink-0 text-right sm:block">
                      <WaitChip req={req} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-1 border-t border-border bg-default/30 px-4 py-2.5 text-xs text-muted">
            <Sparkles className="size-3.5" /> Recommendations compare each request with your team's access and past grants. <Why id="signals" />
          </div>
        </div>
      ) : (
        <EmptyState />
      )}

      {done.length ? <DoneList decided={decided} done={done} /> : null}

      <Modal.Backdrop isOpen={confirmOpen} onOpenChange={setConfirmOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[520px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-[#7c3aed]/10 text-[#7c3aed]">
                <Sparkles className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Accept {recommended.length} recommendations?</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-3">
              <ul className="max-h-[45vh] divide-y divide-border overflow-auto rounded-xl border border-border text-sm">
                {recommended.map((req) => (
                  <li key={req.id} className="flex flex-col gap-1.5 px-3 py-2">
                    <span className="flex items-center gap-3">
                      <RequesterCell req={req} size="sm" />
                      <span className="ms-auto flex items-center gap-2">
                        <ResourceLine res={mainResource(req)} />
                        <VerdictChip verdict={req.recommendation.verdict} />
                      </span>
                    </span>
                    <span className="ps-9 text-xs text-muted">{req.recommendation.reason}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted">
                {approveCount} approved, {denyCount} denied. Access starts right away. You can't undo this.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button
                onPress={() => {
                  setConfirmOpen(false);
                  onAccept(recommended);
                }}
              >
                Accept {recommended.length}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}

function VerdictChip({ verdict }: { verdict: AccessRequest["recommendation"]["verdict"] }) {
  const style =
    verdict === "approve"
      ? "border-[#7c3aed]/25 bg-[#7c3aed]/10 text-[#6d28d9]"
      : verdict === "deny"
        ? "border-border bg-default text-foreground/80"
        : "border-warning/40 bg-warning/10 text-[#b45309]";
  return (
    <span className={`inline-flex h-6 w-fit shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-medium ${style}`}>
      {verdict === "deny" ? <Xmark className="size-3" /> : <Sparkles className="size-3" />} {verdict === "approve" ? "Approve" : verdict === "deny" ? "Deny" : "Review"}
    </span>
  );
}
