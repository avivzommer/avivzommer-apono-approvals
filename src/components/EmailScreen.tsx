import type { Scenario } from "../data";

import { Archive, ArrowLeft, ArrowRight, ArrowShapeTurnUpLeft, Bars, Clock, EllipsisVertical, Envelope, EnvelopeOpen, File, Magnifier, PaperPlane, Pencil, Star, TrashBin, Tray } from "@gravity-ui/icons";
import { Button } from "@heroui/react";

import { explain, first, headline, mainResource } from "../plain";
import { FlagLine, TierChip } from "./Flag";
import { formatExpiry, requestRisk } from "../risk";
import { ResourceLine, UserAvatar, WaitChip } from "./Ui";
import { Why } from "./Why";

/** ?only=REQ-xxxx shows a single request in the email (used by the deck to compare the four flag types). */
const only = new URLSearchParams(window.location.search).get("only");

/** Shared entry point: the approval email. It says what needs you and how urgent; the portal decides. */
export function EmailScreen({ scenario, onOpen }: { scenario: Scenario; onOpen: () => void }) {
  const tierOrder = { notAllowed: 0, mistake: 1, unusual: 2, normal: 3 } as const;
  const single = only ? scenario.requests.filter((r) => r.id === only) : [];
  const attention = (single.length ? single : scenario.requests.filter((r) => requestRisk(r) !== "low"))
    .sort((a, b) => Number(b.expiresInMin < 60) - Number(a.expiresInMin < 60) || tierOrder[explain(a).tier] - tierOrder[explain(b).tier] || a.expiresInMin - b.expiresInMin);
  const routine = single.length ? 0 : scenario.requests.length - attention.length;
  const singleNormal = single.length > 0 && explain(single[0]).tier === "normal";
  const top = attention[0];
  const urgent = top && top.expiresInMin < 60;
  const subject = singleNormal
    ? "1 routine access request"
    : urgent
    ? `Urgent: ${first(top)} needs access for a ${top.ticket?.severity ?? ""} incident (${formatExpiry(top.expiresInMin)} left)`
    : attention.length
      ? `${attention.length} access request${attention.length > 1 ? "s need" : " needs"} your review`
      : `${routine} routine access requests`;

  const nav = [
    { Icon: Tray, label: "Inbox", count: 12, on: true },
    { Icon: Star, label: "Starred" },
    { Icon: Clock, label: "Snoozed" },
    { Icon: PaperPlane, label: "Sent" },
    { Icon: File, label: "Drafts", count: 2 },
  ];
  const tool = "grid size-8 place-items-center rounded-full text-[#444746] hover:bg-black/5";

  return (
    <div className="flex min-h-full flex-col bg-[#f6f8fc] text-[#1f1f1f]">
      {/* Generic mail client chrome: just enough to read as "this is an email" */}
      <div className="flex items-center gap-3 px-3 py-2 sm:px-4">
        <span className={tool}>
          <Bars className="size-5" />
        </span>
        <span className="hidden items-center gap-2 pe-6 text-[19px] text-[#444746] sm:flex">
          <Envelope className="size-6 text-[#4f46e5]" /> Mail
        </span>
        <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-[#e9eef6] px-4 text-sm text-[#5f6368] sm:max-w-[680px]">
          <Magnifier className="size-4 shrink-0" /> Search mail
        </div>
        <span className="ms-auto grid size-8 shrink-0 place-items-center rounded-full bg-[#ef4444] text-xs font-semibold text-white">MC</span>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 pe-2 pb-2 sm:pe-4 sm:pb-4">
        <aside className="hidden w-[220px] shrink-0 flex-col gap-1 ps-2 md:flex">
          <span className="mb-3 flex h-14 w-fit items-center gap-3 rounded-2xl bg-[#c2e7ff] px-5 text-sm font-medium">
            <Pencil className="size-4" /> Compose
          </span>
          {nav.map(({ Icon, label, count, on }) => (
            <span key={label} className={`flex h-8 items-center gap-4 rounded-full px-4 text-sm ${on ? "bg-[#d3e3fd] font-semibold" : "text-[#444746]"}`}>
              <Icon className="size-4" /> {label}
              {count ? <span className="ms-auto text-xs">{count}</span> : null}
            </span>
          ))}
        </aside>

        <div className="ms-2 min-w-0 flex-1 rounded-2xl bg-white sm:ms-0">
          <div className="flex items-center gap-1 border-b border-black/5 px-2 py-1.5 sm:px-4">
            <span className={tool}><ArrowLeft className="size-4" /></span>
            <span className={tool}><Archive className="size-4" /></span>
            <span className={tool}><TrashBin className="size-4" /></span>
            <span className={tool}><EnvelopeOpen className="size-4" /></span>
            <span className="ms-auto text-xs text-[#5f6368]">1 of 12</span>
          </div>

          <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
            <h1 className="flex flex-wrap items-center gap-2 text-[20px] leading-snug sm:ps-12">
              {subject} <span className="rounded bg-[#e8eaed] px-1.5 py-0.5 text-xs text-[#444746]">Inbox</span> <Why id="email" />
            </h1>
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-sm font-bold text-white">a</span>
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <b className="font-semibold">Apono</b>
                  <span className="text-xs text-[#5f6368]">&lt;approvals@apono.io&gt;</span>
                </div>
                <div className="text-xs text-[#5f6368]">to me ▾</div>
              </div>
              <span className="hidden text-xs whitespace-nowrap text-[#5f6368] sm:inline">10:42 AM (2 hours ago)</span>
              <span className={tool}><Star className="size-4" /></span>
              <span className={`${tool} hidden sm:grid`}><ArrowShapeTurnUpLeft className="size-4" /></span>
              <span className={tool}><EllipsisVertical className="size-4" /></span>
            </div>

            <div className="flex w-full max-w-[620px] flex-col gap-3 sm:ps-12">
        {/* Email body */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-4 text-white">
            <span className="text-sm font-semibold">Apono</span>
            <span className="text-sm text-white/70">· Access approvals</span>
          </div>
          <div className="flex flex-col gap-5 px-6 py-6 text-[15px]">
            <p className="text-muted">Hi Maya, here's what's waiting for you.</p>

            {attention.map((req) => {
              const h = headline(req);
              return (
                <div key={req.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2">
                    <UserAvatar initials={req.requester.initials} name={req.requester.name} size="sm" />
                    <span className="text-sm font-semibold">{req.requester.name}</span>
                    <span className="ms-auto">
                      <WaitChip req={req} />
                    </span>
                  </div>
                  <p className="text-sm">
                    Wants to <b>{h.verb}</b> {h.resource}.
                  </p>
                  <ResourceLine res={mainResource(req)} />
                  {explain(req).tier === "normal" ? (
                    <div className="flex flex-col gap-1.5 px-1">
                      <TierChip label={explain(req).label} tier="normal" />
                      <p className="text-sm text-muted">{explain(req).title}</p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-default/50 p-3">
                      <FlagLine req={req} />
                    </div>
                  )}
                </div>
              );
            })}

            {routine ? (
              <p className="text-sm text-muted">
                {attention.length ? "Plus " : ""}
                <b className="text-foreground">{routine} routine</b> request{routine > 1 ? "s" : ""} you can approve together.
              </p>
            ) : null}

            <Button className="w-full sm:w-auto" size="lg" onPress={onOpen}>
              Review in Apono <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="border-t border-border bg-default/30 px-6 py-3 text-xs text-muted">
            Your team is blocked until you decide. Decisions are recorded for audit.
          </div>
                </div>

              <div className="flex gap-2 pt-1">
                <span className="flex h-9 items-center gap-2 rounded-full border border-[#747775] px-4 text-sm text-[#444746]"><ArrowShapeTurnUpLeft className="size-4" /> Reply</span>
                <span className="flex h-9 items-center gap-2 rounded-full border border-[#747775] px-4 text-sm text-[#444746]">Forward</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
