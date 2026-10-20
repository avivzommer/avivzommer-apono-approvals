import type { AccessRequest } from "../data";

import { CircleQuestion, ShieldExclamation, TrashBin } from "@gravity-ui/icons";
import { Button, Checkbox, Label, Modal, TextArea } from "@heroui/react";
import { useState } from "react";

import { allows, envLabel, resourceRisk } from "../risk";
import { Why } from "./Why";

/**
 * Shared risk-adaptive friction (concept E as a mechanism): high-risk grants need a
 * specific acknowledgement per risky resource plus a reason. Medium/low never see this.
 */
export function HighRiskAckModal({
  req,
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  req: AccessRequest;
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const risky = req.resources.filter((r) => resourceRisk(r) === "high");
  const first = req.requester.name.split(" ")[0];
  const [acked, setAcked] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const ready = acked.length === risky.length && reason.trim().length >= 8;

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[560px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-danger/15 text-danger">
              <ShieldExclamation className="size-5" />
            </Modal.Icon>
            <Modal.Heading className="flex items-center gap-2">
              Approve full control? <Why id="ack" />
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <p className="text-sm text-muted">This can't be undone. Tick to confirm you understand what you're giving.</p>
            <div className="flex flex-col gap-2">
              {risky.map((r) => (
                <Checkbox
                  key={r.id}
                  className="rounded-xl border border-border bg-default/40 p-3"
                  isSelected={acked.includes(r.id)}
                  onChange={(v) => setAcked((a) => (v ? [...a, r.id] : a.filter((x) => x !== r.id)))}
                >
                  <Checkbox.Content className="items-start text-sm">
                    <Checkbox.Control className="mt-0.5">
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span>
                      {first} will be able to <b>{allows(r)}</b> on <b>{r.name}</b> ({envLabel[r.env]}) for{" "}
                      <b>{req.durationH}h</b>.
                    </span>
                  </Checkbox.Content>
                </Checkbox>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ack-reason">Why is it needed? (saved to the audit log)</Label>
              <TextArea
                className="h-20 w-full"
                id="ack-reason"
                placeholder="e.g. Needed to roll back the migration for INC-2231"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Back
            </Button>
            <Button
              isDisabled={!ready}
              variant="danger"
              onPress={() => {
                onConfirm(reason.trim());
                setAcked([]);
                setReason("");
              }}
            >
              Approve
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

const rejectReasons = ["Use a narrower level", "Needs a linked ticket", "Not needed for this task", "Too long a duration"];

export function RejectModal({
  req,
  isOpen,
  onOpenChange,
  onConfirm,
  defaultReason,
}: {
  req: AccessRequest;
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (reason: string) => void;
  defaultReason?: string;
}) {
  const [reason, setReason] = useState(defaultReason ?? "");

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[500px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-danger/15 text-danger">
              <TrashBin className="size-5" />
            </Modal.Icon>
            <Modal.Heading>Reject {req.requester.name.split(" ")[0]}'s request?</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            <p className="text-sm text-muted">The requester sees your reason, so they can fix it and resubmit.</p>
            <div className="flex flex-wrap gap-2">
              {rejectReasons.map((r) => (
                <Button key={r} size="sm" variant={reason === r ? "primary" : "tertiary"} onPress={() => setReason(r)}>
                  {r}
                </Button>
              ))}
            </div>
            <TextArea
              aria-label="Rejection reason"
              className="h-20 w-full"
              placeholder="Or write your own reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Back
            </Button>
            <Button
              isDisabled={reason.trim().length < 3}
              variant="danger"
              onPress={() => {
                onConfirm(reason.trim());
                setReason("");
              }}
            >
              Reject request
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

export function AskInfoModal({
  req,
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  req: AccessRequest;
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (question: string) => void;
}) {
  const first = req.requester.name.split(" ")[0];
  const suggestions = [
    "Would a narrower level (e.g. Edit instead of Own) be enough?",
    "Can you link the ticket or incident this is for?",
    `Can you do this in ${req.durationH > 2 ? "less time" : "staging first"}?`,
  ];
  const [q, setQ] = useState("");

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[500px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-accent/15 text-accent">
              <CircleQuestion className="size-5" />
            </Modal.Icon>
            <Modal.Heading className="flex items-center gap-2">
              Ask {first} before deciding <Why id="ask" />
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            <p className="text-sm text-muted">Nothing is granted yet. The request stays open, and you'll be notified when {first} answers.</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <Button key={s} className="justify-start" size="sm" variant={q === s ? "primary" : "tertiary"} onPress={() => setQ(s)}>
                  {s}
                </Button>
              ))}
            </div>
            <TextArea aria-label="Question" className="h-20 w-full" placeholder="Or write your question" value={q} onChange={(e) => setQ(e.target.value)} />
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Back
            </Button>
            <Button
              isDisabled={q.trim().length < 3}
              onPress={() => {
                onConfirm(q.trim());
                setQ("");
              }}
            >
              Send question
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

/** Third way for requests that look wrong: return it to the requester with a suggested fix. Not a rejection. */
export function SendBackModal({
  req,
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  req: AccessRequest;
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (message: string) => void;
}) {
  const [msg, setMsg] = useState(req.mistake?.suggestion ?? "");
  const first = req.requester.name.split(" ")[0];

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-[500px]">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-accent/15 text-accent">
              <CircleQuestion className="size-5" />
            </Modal.Icon>
            <Modal.Heading className="flex items-center gap-2">
              Send back to {first} to fix <Why id="ask" />
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Nothing is granted or rejected. {first} gets your note with one click to fix the request and send it again.
            </p>
            <TextArea aria-label="Note to requester" className="h-24 w-full" value={msg} onChange={(e) => setMsg(e.target.value)} />
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Back
            </Button>
            <Button
              isDisabled={msg.trim().length < 3}
              onPress={() => {
                onConfirm(msg.trim());
              }}
            >
              Send back
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
