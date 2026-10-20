import type { AccessRequest, Resource, Risk } from "../data";
import type { Signal } from "../risk";

import { Clock } from "@gravity-ui/icons";
import { Avatar, Chip } from "@heroui/react";

import { envLabel, formatExpiry, formatWait, levelLabel, resourceRisk, riskColor } from "../risk";

export function RiskChip({ risk, children }: { risk: Risk; children?: React.ReactNode }) {
  return (
    <Chip color={riskColor[risk]} size="sm" variant="soft">
      <Chip.Label>{children ?? `${risk[0].toUpperCase()}${risk.slice(1)} risk`}</Chip.Label>
    </Chip>
  );
}

export function SignalChips({ signals, max = 3 }: { signals: Signal[]; max?: number }) {
  const shown = signals.slice(0, max);
  const rest = signals.length - shown.length;

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {shown.map((s) => (
        <span key={s.label} title={s.reason}>
          <RiskChip risk={s.risk}>{s.label}</RiskChip>
        </span>
      ))}
      {rest > 0 ? <span className="text-xs text-muted">+{rest} more</span> : null}
    </span>
  );
}

export function Person({ req, size = "sm" }: { req: AccessRequest; size?: "sm" | "md" }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar size={size}>
        <Avatar.Fallback>{req.requester.initials}</Avatar.Fallback>
      </Avatar>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium">{req.requester.name}</span>
        <span className="truncate text-xs text-muted">
          {req.requester.role}
          {req.requester.isReport ? " · your report" : ""}
        </span>
      </span>
    </span>
  );
}

export function LevelPill({ res }: { res: Resource }) {
  const risk = resourceRisk(res);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
        risk === "high"
          ? "bg-danger/15 text-danger"
          : risk === "medium"
            ? "bg-warning/15 text-[#b45309]"
            : "bg-default text-foreground"
      }`}
    >
      {levelLabel[res.level]} · {res.env === "prod" ? "prod" : envLabel[res.env]}
    </span>
  );
}

/** One-line summary of what a request wants, leading with its riskiest resource. */
export function AccessSummary({ req }: { req: AccessRequest }) {
  const sorted = [...req.resources].sort((a, b) => rankOf(b) - rankOf(a));
  const top = sorted[0];

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
      <LevelPill res={top} />
      <span className="truncate font-medium">{top.name}</span>
      <span className="text-xs text-muted">{top.type}</span>
      {sorted.length > 1 ? <span className="text-xs text-muted">+{sorted.length - 1} more</span> : null}
    </span>
  );
}

const rankOf = (r: Resource) => ({ low: 0, medium: 1, high: 2 })[resourceRisk(r)] * 10 + (r.level === "own" ? 2 : r.level === "edit" ? 1 : 0);

export function UrgencyChip({ req }: { req: AccessRequest }) {
  const urgent = req.expiresInMin < 60;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs whitespace-nowrap tabular ${urgent ? "font-semibold text-danger" : "text-muted"}`}
    >
      <Clock className="size-3.5" />
      {urgent ? `SLA in ${formatExpiry(req.expiresInMin)}` : `waiting ${formatWait(req.waitingMin)}`}
    </span>
  );
}
