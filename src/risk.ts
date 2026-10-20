import type { AccessRequest, Level, Resource, Risk } from "./data";

import { approver } from "./data";

export interface Signal {
  risk: Risk;
  label: string;
  /** Plain-language reason shown next to the flag (P2: explain, don't give a verdict). */
  reason: string;
}

const rank: Record<Risk, number> = { low: 0, medium: 1, high: 2 };
export const maxRisk = (a: Risk, b: Risk): Risk => (rank[a] >= rank[b] ? a : b);

export const envLabel = { prod: "production", staging: "staging", dev: "dev" } as const;
export const levelLabel: Record<Level, string> = { view: "View", edit: "Edit", own: "Own" };

export function resourceRisk(res: Resource): Risk {
  if (res.level === "own" && res.env === "prod") return "high";
  if (res.sensitive && res.env === "prod" && res.level !== "view") return "high";
  if (res.level === "edit" && res.env === "prod") return "medium";
  if (res.level === "own") return "medium";
  if (res.sensitive && res.env === "prod") return "medium";
  return "low";
}

export function resourceSignals(res: Resource, requesterFirstName: string): Signal[] {
  const out: Signal[] = [];
  if (res.level === "own" && res.env === "prod")
    out.push({ risk: "high", label: "Own on production", reason: `Full control of ${res.name}, including deleting it` });
  else if (res.level === "edit" && res.env === "prod")
    out.push({ risk: "medium", label: "Edit on production", reason: `Can change live ${res.type.toLowerCase()} data` });
  if (res.sensitive)
    out.push({
      risk: res.env === "prod" ? (res.level === "view" ? "medium" : "high") : "low",
      label: `${res.sensitive[0].toUpperCase()}${res.sensitive.slice(1)} data`,
      reason: `${res.name} is tagged ${res.sensitive}`,
    });
  if (res.grantedBefore === 0 && res.level !== "view")
    out.push({ risk: "medium", label: `First time for ${requesterFirstName}`, reason: `${requesterFirstName} has never had ${levelLabel[res.level]} here` });
  if (res.peersWithLevel <= 1 && res.level !== "view")
    out.push({
      risk: "medium",
      label: `${res.peersWithLevel} of ${approver.teamSize} teammates`,
      reason: `${res.peersWithLevel === 0 ? "No one" : "Only 1 person"} on your team has ${levelLabel[res.level]} on ${res.name}`,
    });
  return out;
}

export function requestRisk(req: AccessRequest): Risk {
  let risk: Risk = "low";
  for (const res of req.resources) risk = maxRisk(risk, resourceRisk(res));
  if (req.durationH > 8) risk = maxRisk(risk, "medium");
  return risk;
}

/** Request-level signals, most severe first, deduplicated by label. */
export function requestSignals(req: AccessRequest): Signal[] {
  const first = req.requester.name.split(" ")[0];
  const all = req.resources.flatMap((res) => resourceSignals(res, first));
  if (req.durationH > 8) all.push({ risk: "medium", label: `${req.durationH}h duration`, reason: "Longer than the 8h team norm" });
  if (!req.ticket && requestRisk(req) !== "low")
    all.push({ risk: "medium", label: "No ticket linked", reason: "The justification isn't tied to a ticket or incident" });
  const seen = new Set<string>();
  return all
    .filter((s) => (seen.has(s.label) ? false : (seen.add(s.label), true)))
    .sort((a, b) => rank[b.risk] - rank[a.risk]);
}

/** Why a routine request is routine: the evidence that makes it safe to batch. */
export function routineReason(req: AccessRequest): string {
  const top = req.resources.reduce((a, b) => (b.peersWithLevel < a.peersWithLevel ? b : a));
  const granted = Math.min(...req.resources.map((r) => r.grantedBefore));
  const allNonProd = req.resources.every((r) => r.env !== "prod");
  const parts: string[] = [];
  if (allNonProd) parts.push("Non-production only");
  else if (req.resources.every((r) => r.level === "view")) parts.push("Read-only");
  parts.push(`${top.peersWithLevel} of ${approver.teamSize} teammates have this`);
  if (granted > 0) parts.push(`granted ${granted}× before`);
  return parts.join(" · ");
}

export function allows(res: Resource): string {
  const t = res.type;
  if (res.level === "view") return t === "Secret" ? "read the secret value" : "read data and configuration";
  if (res.level === "edit")
    return t === "RDS database" ? "read and change rows" : t === "EKS namespace" ? "deploy and restart workloads" : "change data and configuration";
  if (t === "RDS database") return "delete the database, change parameters, read all rows";
  if (t === "IAM role") return "change the role's permissions and who can assume it";
  return "delete it and change who has access";
}

export function formatWait(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatExpiry(min: number): string {
  if (min < 60) return `${min} min`;
  if (min < 24 * 60) return formatWait(min);
  return `${Math.round(min / 60 / 24)} days`;
}

export const riskColor: Record<Risk, "danger" | "warning" | "success"> = { high: "danger", medium: "warning", low: "success" };
