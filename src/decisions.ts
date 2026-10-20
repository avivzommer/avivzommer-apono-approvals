import type { AccessRequest, Env, Level, Risk } from "./data";

export type OptionId = "A" | "B" | "C";

export const optionMeta: Record<OptionId, { name: string; short: string; unit: string }> = {
  A: { name: "Risk-lane inbox", short: "Inbox lanes", unit: "the queue" },
  B: { name: "Per-resource review", short: "Per item", unit: "the resource" },
  C: { name: "Recommendation-first", short: "Recommendations", unit: "the system's proposal" },
};

export type Outcome = "approved" | "partially approved" | "rejected" | "info requested" | "sent back to fix";

export interface Grant {
  resource: string;
  level: Level;
  env: Env;
}

export interface DecisionRecord {
  id: string;
  requestId: string;
  option: OptionId;
  scenario: string;
  at: Date;
  requester: string;
  outcome: Outcome;
  granted: Grant[];
  denied: Grant[];
  durationH: number;
  risk: Risk;
  reason?: string;
  method: string;
  /** What the approver was shown at the moment of decision (P5). */
  shown: string[];
  isTrap?: boolean;
}

export const grantsOf = (req: AccessRequest): Grant[] =>
  req.resources.map((r) => ({ resource: r.name, level: r.level, env: r.env }));

let seq = 1;
export const newRecordId = () => `DEC-${String(9000 + seq++)}`;
