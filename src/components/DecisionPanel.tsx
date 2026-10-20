import type { AccessRequest } from "../data";

import { ArrowShapeTurnUpLeft, Check, ChevronRight, Comment, Lock, Ticket, Xmark } from "@gravity-ui/icons";
import { Button, Drawer } from "@heroui/react";
import { useState } from "react";

import { approver } from "../data";
import { explain, first, headline, mainResource, resourcePhrase, smallerVersion } from "../plain";
import { allows, levelLabel, requestRisk } from "../risk";
import { AskInfoModal, HighRiskAckModal, RejectModal, SendBackModal } from "./DecisionModals";
import { FlagCard } from "./Flag";
import { ResourceLine, UserAvatar, WaitChip } from "./Ui";
import { Why } from "./Why";

export interface PanelActions {
  onApprove: (req: AccessRequest, reason?: string) => void;
  onReject: (req: AccessRequest, reason: string) => void;
  onAsk: (req: AccessRequest, question: string) => void;
  onApproveSmaller: (req: AccessRequest) => void;
  onSendBack: (req: AccessRequest, message: string) => void;
}

/**
 * Shared single-request decision view. Reads top to bottom as three answers:
 * what do they want → why look carefully → what's their reason. Everything else is under "Details".
 */
export function DecisionPanel({ req, onClose, actions }: { req: AccessRequest | null; onClose: () => void; actions: PanelActions }) {
  const [modal, setModal] = useState<null | "ack" | "reject" | "ask" | "sendBack">(null);
  const [details, setDetails] = useState(false);

  if (!req) return null;
  const risk = requestRisk(req);
  const h = headline(req);
  const e = explain(req);
  const smaller = smallerVersion(req);
  const approveAsAsked = () => (risk === "high" ? setModal("ack") : actions.onApprove(req));
  const name = first(req);
  const main = mainResource(req);
  const others = req.resources.filter((r) => r !== main);

  return (
    <Drawer.Backdrop isOpen onOpenChange={(o) => (o ? null : onClose())}>
      <Drawer.Content placement="right">
        <Drawer.Dialog className="w-full sm:w-[620px]">
          <Drawer.Header className="flex flex-col items-stretch gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="tabular">{req.id}</span>
              <span>·</span>
              <WaitChip req={req} />

            </div>
            <div className="flex items-center gap-3">
              <UserAvatar initials={req.requester.initials} name={req.requester.name} size="lg" />
              <div className="flex min-w-0 flex-col">
                <Drawer.Heading className="text-base font-semibold">{req.requester.name}</Drawer.Heading>
                <span className="text-xs text-muted">
                  {req.requester.role}
                  {req.requester.isReport ? " · reports to you" : ""}
                </span>
              </div>
            </div>
          </Drawer.Header>

          <Drawer.Body className="flex flex-col gap-6 py-6">
            {/* 1. What do they want? */}
            <section className="flex flex-col gap-3">
              <p className="text-lg leading-snug">
                {name} wants to <b>{h.verb}</b> {h.resource} for {h.duration}.
              </p>
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
                {[main, ...others].map((r) => (
                  <li key={r.id} className="px-3 py-2.5 text-sm">
                    <ResourceLine res={r} />
                  </li>
                ))}
              </ul>
            </section>

            {/* 2. Compared to normal: quiet when it matches, one plain sentence when it doesn't */}
            <div className="relative">
              <FlagCard req={req} />
              <span className="absolute end-3 top-3">
                <Why id="signals" align="right" />
              </span>
            </div>

            {/* 3. What's their reason? */}
            <section className="flex gap-3">
              <Comment className="mt-0.5 size-4 shrink-0 text-muted" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{name}'s reason</h3>
                <p className="mt-1 text-sm text-foreground/80">"{req.justification}"</p>
                <span
                  className={`mt-2 inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs ${
                    req.ticket ? "border-border text-foreground/80" : "border-dashed border-border text-muted"
                  }`}
                >
                  <Ticket className="size-3.5" />
                  {req.ticket ? `${req.ticket.severity ? `${req.ticket.severity} · ` : ""}${req.ticket.id} · ${req.ticket.title}` : "No ticket linked"}
                </span>
              </div>
            </section>

            {/* Everything else, on demand */}
            <section className="border-t border-border pt-4">
              <button className="flex items-center gap-1 text-sm text-muted hover:text-foreground" type="button" onClick={() => setDetails((v) => !v)}>
                <ChevronRight className={`size-4 transition-transform ${details ? "rotate-90" : ""}`} />
                Technical details <Why id="tiers" />
              </button>
              {details ? (
                <ul className="mt-3 flex flex-col gap-2 text-sm">
                  {req.resources.map((r) => (
                    <li key={r.id} className="rounded-xl bg-default/50 p-3">
                      <div className="font-medium">
                        {levelLabel[r.level]} · {resourcePhrase(r)}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        Allows: {allows(r)} · {r.peersWithLevel} of {approver.teamSize} teammates have this · granted {r.grantedBefore}× before
                      </div>
                      <code className="mt-2 block truncate font-mono text-[11px] text-muted">
                        arn:aws:{r.type.split(" ")[0].toLowerCase()}:eu-west-1:4821:{r.name}
                      </code>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </Drawer.Body>

          <Drawer.Footer className="flex-col items-stretch gap-3 border-t border-border bg-default/30 pt-4">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Lock className="size-3.5" /> Final once sent · saved to the audit log with what you saw here <Why id="accountability" />
            </p>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap [&>button]:shrink-0">
              {e.tier === "notAllowed" ? (
                <>
                  <Button size="sm" variant="ghost" onPress={() => setModal("ack")}>
                    Approve anyway…
                  </Button>
                  <Button className="order-first w-full sm:order-last sm:ms-auto sm:w-auto" variant="danger" onPress={() => setModal("reject")}>
                    <Xmark className="size-4" /> Deny
                  </Button>
                </>
              ) : e.tier === "mistake" ? (
                <>
                  <Button variant="secondary" onPress={() => setModal("reject")}>
                    Reject
                  </Button>
                  <Button variant="tertiary" onPress={approveAsAsked}>
                    Approve as asked
                  </Button>
                  <Button className="order-first w-full sm:order-last sm:ms-auto sm:w-auto" onPress={() => setModal("sendBack")}>
                    <ArrowShapeTurnUpLeft className="size-4" /> Send back to fix
                  </Button>
                </>
              ) : e.tier === "unusual" && smaller ? (
                <>
                  <Button variant="tertiary" onPress={() => setModal("ask")}>
                    <Comment className="size-4" /> Ask
                  </Button>
                  <Button variant="secondary" onPress={() => setModal("reject")}>
                    Reject
                  </Button>
                  <Button className="sm:ms-auto" variant="tertiary" onPress={approveAsAsked}>
                    Approve as asked
                  </Button>
                  <Button className="order-first w-full sm:order-last sm:w-auto" onPress={() => actions.onApproveSmaller(req)}>
                    <Check className="size-4" /> {smaller.label}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="tertiary" onPress={() => setModal("ask")}>
                    <Comment className="size-4" /> Ask {name}
                  </Button>
                  <Button variant="secondary" onPress={() => setModal("reject")}>
                    <Xmark className="size-4" /> Reject
                  </Button>
                  <Button className="order-first w-full sm:order-last sm:ms-auto sm:w-auto" onPress={approveAsAsked}>
                    <Check className="size-4" /> Approve
                  </Button>
                </>
              )}
            </div>
          </Drawer.Footer>

          <HighRiskAckModal
            isOpen={modal === "ack"}
            req={req}
            onConfirm={(reason) => {
              setModal(null);
              actions.onApprove(req, reason);
            }}
            onOpenChange={(o) => setModal(o ? "ack" : null)}
          />
          <RejectModal
            defaultReason={e.tier === "notAllowed" ? `Not allowed: ${req.redLine!.title} ${req.redLine!.instead}` : undefined}
            isOpen={modal === "reject"}
            req={req}
            onConfirm={(reason) => {
              setModal(null);
              actions.onReject(req, reason);
            }}
            onOpenChange={(o) => setModal(o ? "reject" : null)}
          />
          <SendBackModal
            isOpen={modal === "sendBack"}
            req={req}
            onConfirm={(m) => {
              setModal(null);
              actions.onSendBack(req, m);
            }}
            onOpenChange={(o) => setModal(o ? "sendBack" : null)}
          />
          <AskInfoModal
            isOpen={modal === "ask"}
            req={req}
            onConfirm={(q) => {
              setModal(null);
              actions.onAsk(req, q);
            }}
            onOpenChange={(o) => setModal(o ? "ask" : null)}
          />
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
