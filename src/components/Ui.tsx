import type { AccessRequest, Env, Level, Resource, Risk } from "../data";

import {
  Bucket,
  Clock,
  Database,
  Eye,
  FileText,
  Function as FunctionIcon,
  Key,
  Layers,
  LayoutCells,
  ListUl,
  Lock,
  Pencil,
  Shield,
  TriangleExclamation,
  CircleInfo,
} from "@gravity-ui/icons";

import { formatExpiry, formatWait, levelLabel } from "../risk";

/* ------------------------------------------------------------------ *
 * Small, consistent B2B UI kit: icons, chips, avatars, headers.
 * One visual language across all three options so only the flow differs.
 * ------------------------------------------------------------------ */

const typeIcon: Record<Resource["type"], typeof Database> = {
  "S3 bucket": Bucket,
  "RDS database": Database,
  "EKS namespace": Layers,
  "IAM role": Shield,
  "DynamoDB table": LayoutCells,
  Lambda: FunctionIcon,
  Secret: Lock,
  "CloudWatch logs": FileText,
  "SQS queue": ListUl,
};

export function ResourceIcon({ res, size = "md" }: { res: Resource; size?: "sm" | "md" }) {
  const Icon = typeIcon[res.type];
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg border border-border bg-default/70 text-muted ${size === "sm" ? "size-6" : "size-8"}`}
      title={res.type}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
    </span>
  );
}

const levelIcon: Record<Level, typeof Eye> = { view: Eye, edit: Pencil, own: Key };

/** Neutral by design: level is a fact, not an alarm. Red is reserved for the one flag per request. */
export function LevelChip({ level }: { level: Level; risk?: Risk }) {
  const Icon = levelIcon[level];
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-md border border-border bg-default/60 px-1.5 text-xs whitespace-nowrap text-foreground/80 ${
        level === "own" ? "font-semibold text-foreground" : "font-medium"
      }`}
    >
      <Icon className="size-3.5" />
      {levelLabel[level]}
    </span>
  );
}

const envTone: Record<Env, string> = {
  prod: "text-foreground/80",
  staging: "text-foreground/70",
  dev: "text-muted",
};
const envText: Record<Env, string> = { prod: "Production", staging: "Staging", dev: "Dev" };

export function EnvChip({ env }: { env: Env }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-md border border-border bg-surface px-1.5 text-xs font-medium whitespace-nowrap ${envTone[env]}`}>
      <span className={`size-1.5 rounded-full ${env === "prod" ? "bg-foreground/70" : env === "staging" ? "bg-foreground/35" : "bg-foreground/15"}`} />
      {envText[env]}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: Risk }) {
  const map = {
    high: { cls: "bg-danger/10 text-danger border-danger/25", label: "High risk" },
    medium: { cls: "bg-warning/10 text-[#b45309] border-warning/40", label: "Medium risk" },
    low: { cls: "bg-surface text-muted border-border", label: "Routine" },
  }[risk];
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full border px-2 text-xs font-medium whitespace-nowrap ${map.cls}`}>
      <span className={`size-1.5 rounded-full ${risk === "high" ? "bg-danger" : risk === "medium" ? "bg-warning" : "bg-foreground/20"}`} />
      {map.label}
    </span>
  );
}

/** A resource as one compact line: icon · name · level · env. */
export function ResourceLine({ res, showType = false }: { res: Resource; showType?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <ResourceIcon res={res} size="sm" />
      <span className="min-w-0 truncate font-medium">{res.name}</span>
      {showType ? <span className="hidden truncate text-xs text-muted md:inline">{res.type}</span> : null}
      <LevelChip level={res.level} />
      <EnvChip env={res.env} />
    </span>
  );
}

const palette = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444", "#64748b", "#84cc16"];

export function UserAvatar({ name, initials, size = "md" }: { name: string; initials: string; size?: "sm" | "md" | "lg" }) {
  const color = palette[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % palette.length];
  const dim = size === "sm" ? "size-6 text-[10px]" : size === "lg" ? "size-10 text-sm" : "size-8 text-xs";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${dim}`} style={{ background: color }}>
      {initials}
    </span>
  );
}

export function RequesterCell({ req, size = "md" }: { req: AccessRequest; size?: "sm" | "md" | "lg" }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <UserAvatar initials={req.requester.initials} name={req.requester.name} size={size} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium">{req.requester.name}</span>
        <span className="truncate text-xs text-muted">{req.requester.role}</span>
      </span>
    </span>
  );
}

export function WaitChip({ req }: { req: AccessRequest }) {
  const urgent = req.expiresInMin < 60;
  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-xs whitespace-nowrap tabular ${
        urgent ? "bg-warning/15 font-semibold text-[#b45309]" : "text-muted"
      }`}
    >
      <Clock className="size-3.5" />
      {urgent ? `${formatExpiry(req.expiresInMin)} left` : formatWait(req.waitingMin)}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-muted">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:ms-auto sm:shrink-0">{actions}</div> : null}
    </div>
  );
}

export function SectionTitle({ icon, children, count, aside }: { icon?: React.ReactNode; children: React.ReactNode; count?: number; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-sm font-semibold">{children}</h2>
      {count !== undefined ? <span className="rounded-md bg-default px-1.5 text-xs font-medium text-muted tabular">{count}</span> : null}
      {aside ? <span className="ms-auto text-xs text-muted">{aside}</span> : null}
    </div>
  );
}

/** Summary pill used in page headers. */
export function StatPill({ tone, icon, children }: { tone?: "danger" | "success" | "default"; icon?: React.ReactNode; children: React.ReactNode }) {
  const cls = tone === "danger" ? "border-danger/25 bg-danger/5 text-danger" : tone === "success" ? "border-success/25 bg-success/5 text-success" : "border-border bg-surface text-foreground/80";
  return <span className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap ${cls}`}>{icon}{children}</span>;
}

export function TableHead({ cols, className = "" }: { cols: { label: string; className?: string }[]; className?: string }) {
  return (
    <div className={`hidden items-center gap-3 border-b border-border bg-default/40 px-4 py-2 text-[11px] font-medium tracking-wide text-muted uppercase sm:flex ${className}`}>
      {cols.map((c) => (
        <span key={c.label} className={c.className}>
          {c.label}
        </span>
      ))}
    </div>
  );
}

/**
 * The single red element on a risky request: the main reason it's flagged,
 * its consequence, and (optionally) supporting facts in neutral text.
 */
export function RiskCallout({
  main,
  consequence,
  supporting = [],
  size = "md",
  tone = "danger",
}: {
  main: string;
  consequence?: string;
  supporting?: string[];
  size?: "sm" | "md";
  tone?: "danger" | "neutral";
}) {
  const Icon = tone === "danger" ? TriangleExclamation : CircleInfo;
  return (
    <div className="flex gap-2.5">
      <Icon className={`mt-0.5 shrink-0 ${tone === "danger" ? "text-danger" : "text-muted"} ${size === "sm" ? "size-3.5" : "size-4"}`} />
      <div className="min-w-0">
        <p className={`${tone === "danger" ? "font-semibold text-danger" : "font-medium text-foreground/80"} ${size === "sm" ? "text-sm" : "text-[15px]"}`}>{main}</p>
        {consequence ? <p className="mt-0.5 text-sm text-foreground/80">{consequence}</p> : null}
        {supporting.length ? <p className="mt-1 text-xs text-muted">{supporting.join(" · ")}</p> : null}
      </div>
    </div>
  );
}
