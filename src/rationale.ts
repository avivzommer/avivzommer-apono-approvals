/** Rationale notes shown in "Show rationale" mode. Each ties a UI decision to a principle and its evidence. */
export const rationale = {
  email: {
    title: "The email triages, the portal decides",
    principle: "P1 Risk & urgency decide the path",
    source: "Entra review email: one CTA + deadline (W4) · journey breakpoint 2 (ignored emails)",
  },
  lanes: {
    title: "Two lanes: attention vs. routine",
    principle: "P1 Risk decides the path",
    source: "C1 review assistant excludes high-risk from bulk (W6) · Opal / Square rules funnel (S1) · habituation (A-1), compliance budget (A-2)",
  },
  routineReason: {
    title: "Every routine row says WHY it's routine",
    principle: "P2 Explain, don't give a verdict",
    source: "C1 insight '1 of 302 users' (W5) · Entra reason column (W8) · automation bias (A-5)",
  },
  urgency: {
    title: "Wait time and expiry on every item",
    principle: "P1 Honest urgency",
    source: "Vanta overdue / due soon (W11–W12) · SailPoint 'days old' (W3) · Apono fails requests after 7 days",
  },
  stage: {
    title: "Decide ≠ commit: stage, review, then submit",
    principle: "P4 Review before commit",
    source: "C1 staged decisions + Submit (W7) · Entra 'previous decisions will not be changed' (W9)",
  },
  signals: {
    title: "Flags with plain-language reasons",
    principle: "P2 Explain, don't give a verdict",
    source: "C1 flagged insights (W5) · Navan / Expensify flags · A-5",
  },
  tiers: {
    title: "T1 at a glance, T2 one step, T3 raw",
    principle: "P3 What decides it is at a glance",
    source: "Apono today hides permissions behind 'More details' (W1–W2) · progressive disclosure (A-7)",
  },
  ack: {
    title: "High risk asks for a specific acknowledgement",
    principle: "P1 + P4 (risk-adaptive friction)",
    source: "Polymorphic warnings resist habituation (A-1) · Entra PIM per-role justification · SailPoint e-signature",
  },
  ask: {
    title: "A third way: ask for info",
    principle: "P4 Always a way out",
    source: "Okta OIG question steps · Entra 'Don't know' (W10) · stalls or reflex-approves without it (D7)",
  },
  audit: {
    title: "The record stores what was SHOWN, not just the click",
    principle: "P5 Every decision leaves evidence",
    source: "SOC 2 CC6.2/6.3 · accountability before deciding (A-4)",
  },
  accountability: {
    title: "Accountability is visible before the decision",
    principle: "P5 Every decision leaves evidence",
    source: "Lerner & Tetlock 1999: pre-decisional accountability improves effortful judgment (A-4)",
  },
} as const;

export type RationaleId = keyof typeof rationale;
