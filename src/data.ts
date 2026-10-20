export type Env = "prod" | "staging" | "dev";
export type Level = "view" | "edit" | "own";
export type Risk = "low" | "medium" | "high";
export type ResourceType = "S3 bucket" | "RDS database" | "EKS namespace" | "IAM role" | "DynamoDB table" | "Lambda" | "Secret" | "CloudWatch logs" | "SQS queue";

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  env: Env;
  level: Level;
  sensitive?: "financial" | "credentials" | "PII";
  /** Teammates who currently hold this exact level on this resource. */
  peersWithLevel: number;
  /** Times this requester was granted this resource before. */
  grantedBefore: number;
}

export interface Person {
  name: string;
  initials: string;
  role: string;
  isReport: boolean;
}

export interface Recommendation {
  verdict: "approve" | "deny" | "review";
  reason: string;
}

export interface AccessRequest {
  id: string;
  requester: Person;
  justification: string;
  ticket?: { id: string; title: string; severity?: "P1" | "P2" };
  durationH: number;
  waitingMin: number;
  /** Minutes until the request auto-fails (Apono: 7 days) or the incident SLA. */
  expiresInMin: number;
  resources: Resource[];
  /** What a market-style recommendation engine would say (used by Option C). */
  recommendation: Recommendation;
  /** True for the deliberately risky "trap" item used in testing. */
  isTrap?: boolean;
  /** What the team normally gets for the main resource (the "compared to normal" baseline). */
  usual?: { level: Level; durationH: number };
  /** Policy red line: never approved through a request. */
  redLine?: { title: string; why: string; instead: string };
  /** The request itself looks wrong (e.g. wrong environment picked). */
  mistake?: { title: string; why: string; suggestion: string };
  /** Extra context facts, in plain words. */
  context?: string[];
}

export interface Scenario {
  id: "routine" | "trap" | "incident" | "mixed";
  label: string;
  short: string;
  description: string;
  requests: AccessRequest[];
}

export const approver = { name: "Maya Cohen", initials: "MC", role: "Engineering Manager · Payments", teamSize: 9 };

const person = (name: string, role: string, isReport = true): Person => ({
  name,
  role,
  isReport,
  initials: name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2),
});

const r = (
  id: string,
  name: string,
  type: ResourceType,
  env: Env,
  level: Level,
  peersWithLevel: number,
  grantedBefore: number,
  sensitive?: Resource["sensitive"],
): Resource => ({ id, name, type, env, level, peersWithLevel, grantedBefore, sensitive });

const routineRequests: AccessRequest[] = [
  {
    id: "REQ-4821",
    requester: person("Noa Shapiro", "Backend engineer"),
    justification: "Investigate slow invoice exports reported by support",
    ticket: { id: "PAY-1182", title: "Invoice export latency" },
    durationH: 2,
    waitingMin: 48,
    expiresInMin: 7 * 24 * 60 - 48,
    resources: [
      r("billing-logs", "billing-logs", "S3 bucket", "prod", "view", 8, 6),
      r("cw-payments", "payments-api logs", "CloudWatch logs", "prod", "view", 9, 6),
    ],
    recommendation: { verdict: "approve", reason: "8 of 9 teammates have this · granted to Noa 6× before" },
  },
  {
    id: "REQ-4822",
    requester: person("Avi Ronen", "Backend engineer"),
    justification: "Deploy fix for retry logic to staging",
    ticket: { id: "PAY-1190", title: "Retry storm on webhook failures" },
    durationH: 4,
    waitingMin: 35,
    expiresInMin: 7 * 24 * 60 - 35,
    resources: [r("eks-pay-stg", "payments-api", "EKS namespace", "staging", "edit", 7, 4)],
    recommendation: { verdict: "approve", reason: "7 of 9 teammates have this · granted to Avi 4× before" },
  },
  {
    id: "REQ-4823",
    requester: person("Lior Ben-David", "Data engineer"),
    justification: "Validate new reconciliation query against staging replica",
    durationH: 3,
    waitingMin: 22,
    expiresInMin: 7 * 24 * 60 - 22,
    resources: [r("orders-replica", "orders-db-replica", "RDS database", "staging", "view", 6, 2)],
    recommendation: { verdict: "deny", reason: "Lior already has this access until 18:00 · duplicate request" },
  },
  {
    id: "REQ-4824",
    requester: person("Tamar Levi", "Frontend engineer"),
    justification: "Upload test fixtures for checkout redesign",
    durationH: 2,
    waitingMin: 15,
    expiresInMin: 7 * 24 * 60 - 15,
    resources: [
      r("assets-dev", "checkout-assets-dev", "S3 bucket", "dev", "edit", 8, 3),
      r("fixtures-dev", "test-fixtures", "S3 bucket", "dev", "edit", 8, 3),
    ],
    recommendation: { verdict: "approve", reason: "Dev only · 8 of 9 teammates have this" },
  },
  {
    id: "REQ-4825",
    requester: person("Yossi Kaplan", "Backend engineer"),
    justification: "Toggle feature flag for internal beta",
    durationH: 1,
    waitingMin: 9,
    expiresInMin: 7 * 24 * 60 - 9,
    resources: [r("flags-dev", "feature-flags", "DynamoDB table", "dev", "edit", 9, 5)],
    recommendation: { verdict: "approve", reason: "Dev only · everyone on the team has this" },
  },
  {
    id: "REQ-4826",
    requester: person("Shira Mor", "SRE"),
    justification: "Check error rates after last night's deploy",
    durationH: 2,
    waitingMin: 6,
    expiresInMin: 7 * 24 * 60 - 6,
    resources: [r("cw-gateway", "api-gateway logs", "CloudWatch logs", "prod", "view", 9, 11)],
    recommendation: { verdict: "approve", reason: "Read-only logs · granted to Shira 11× before" },
  },
];

const trapRequest: AccessRequest = {
  id: "REQ-4830",
  requester: person("Dana Levi", "Backend engineer"),
  justification: "Debug failed migration",
  durationH: 4,
  waitingMin: 130,
  expiresInMin: 7 * 24 * 60 - 130,
  resources: [
    r("billing-logs-d", "billing-logs", "S3 bucket", "prod", "view", 8, 2),
    r("eks-pay-stg-d", "payments-api", "EKS namespace", "staging", "edit", 7, 2),
    r("prod-billing-db", "prod-billing-db", "RDS database", "prod", "own", 0, 0, "financial"),
  ],
  // Market engines mostly compare access at the resource level, not the permission level,
  // so the Own-on-prod line hides behind "teammates use these resources".
  recommendation: { verdict: "approve", reason: "5 of 9 teammates access these resources · used in the last 30 days" },
  isTrap: true,
  usual: { level: "edit", durationH: 1 },
};

const trapFiller: AccessRequest[] = [
  {
    id: "REQ-4827",
    requester: person("Eitan Golan", "Backend engineer"),
    justification: "Debug timeout in refund lambda on staging",
    durationH: 2,
    waitingMin: 70,
    expiresInMin: 7 * 24 * 60 - 70,
    resources: [r("refund-fn-stg", "refund-processor", "Lambda", "staging", "edit", 6, 3)],
    recommendation: { verdict: "approve", reason: "6 of 9 teammates have this · granted 3× before" },
  },
  {
    id: "REQ-4828",
    requester: person("Rotem Azulay", "Data analyst"),
    justification: "Monthly KPI dashboard refresh",
    durationH: 3,
    waitingMin: 55,
    expiresInMin: 7 * 24 * 60 - 55,
    resources: [r("analytics-dev", "analytics-exports", "S3 bucket", "dev", "view", 9, 8)],
    recommendation: { verdict: "deny", reason: "Rotem didn't use this access the last 3 times it was granted" },
  },
  {
    id: "REQ-4829",
    requester: person("Gal Peretz", "Platform engineer"),
    justification: "Tune autoscaling on dev cluster",
    durationH: 4,
    waitingMin: 41,
    expiresInMin: 7 * 24 * 60 - 41,
    resources: [r("eks-dev", "payments-dev", "EKS namespace", "dev", "edit", 8, 6)],
    recommendation: { verdict: "approve", reason: "Dev only · granted 6× before" },
  },
];

const incidentRequest: AccessRequest = {
  id: "REQ-4840",
  requester: person("Omer Katz", "SRE · on-call"),
  justification: "Checkout returning 500s, need to roll back payments-worker and inspect DB locks",
  ticket: { id: "INC-2231", title: "Checkout 500s: payments down", severity: "P1" },
  durationH: 2,
  waitingMin: 12,
  expiresInMin: 18,
  resources: [
    r("cw-payments-i", "payments-api logs", "CloudWatch logs", "prod", "view", 9, 14),
    r("billing-logs-i", "billing-logs", "S3 bucket", "prod", "view", 8, 9),
    r("sqs-pay", "payments-events", "SQS queue", "prod", "view", 7, 6),
    r("eks-pay-prod", "payments-api", "EKS namespace", "prod", "edit", 3, 4),
    r("refund-fn-prod", "refund-processor", "Lambda", "prod", "edit", 2, 1),
    r("pay-db-secret", "payments-db credentials", "Secret", "prod", "view", 2, 1, "credentials"),
    r("prod-billing-db-i", "prod-billing-db", "RDS database", "prod", "edit", 1, 1, "financial"),
    r("iam-pay-worker", "payments-worker-role", "IAM role", "prod", "own", 0, 0),
  ],
  recommendation: { verdict: "review", reason: "Own on a production IAM role · not held by any teammate" },
  usual: { level: "edit", durationH: 2 },
};

const redLineRequest: AccessRequest = {
  id: "REQ-4850",
  requester: person("Ben Carter", "Contractor · Payments"),
  justification: "need access",
  durationH: 168,
  waitingMin: 25,
  expiresInMin: 7 * 24 * 60 - 25,
  resources: [r("iam-pay-admin", "payments-admin", "IAM role", "prod", "own", 0, 0)],
  recommendation: { verdict: "review", reason: "Admin role · not held by any teammate" },
  redLine: {
    title: "This would give Ben admin rights in production.",
    why: "With admin rights, someone can give themselves any other access. Admin rights are never approved through a request.",
    instead: "Ask for the specific resource you need, with a ticket.",
  },
  context: ["Ben's contract ends Friday", "Requested at 02:14 from a new country", "No ticket linked"],
};

const mistakeRequest: AccessRequest = {
  id: "REQ-4851",
  requester: person("Tamar Levi", "Frontend engineer"),
  justification: "Upload test fixtures for checkout redesign",
  durationH: 2,
  waitingMin: 18,
  expiresInMin: 7 * 24 * 60 - 18,
  resources: [r("assets-prod", "checkout-assets", "S3 bucket", "prod", "edit", 1, 0)],
  recommendation: { verdict: "approve", reason: "Tamar has edited checkout assets 3× before" },
  mistake: {
    title: "Tamar asked for production, but this looks like test work.",
    why: 'Her reason says "test fixtures", and she has only ever worked in dev. The wrong environment was probably picked.',
    suggestion: "Did you mean checkout-assets-dev (dev)? Please fix the environment and send the request again.",
  },
};

export const scenarios: Scenario[] = [
  {
    id: "routine",
    label: "1 · Routine morning",
    short: "Routine",
    description: "6 everyday requests, all low risk. Tests speed: can Maya clear the queue in under a minute?",
    requests: routineRequests,
  },
  {
    id: "trap",
    label: "2 · Hidden risk",
    short: "Hidden risk",
    description:
      "10 requests. 9 are routine; one (Dana) quietly asks for Own on a production billing DB. Tests rubber-stamping.",
    requests: [routineRequests[0], routineRequests[1], trapFiller[0], routineRequests[2], trapRequest, trapFiller[1], routineRequests[3], trapFiller[2], routineRequests[4], routineRequests[5]],
  },
  {
    id: "mixed",
    label: "4 · Approve, fix, deny",
    short: "Mixed",
    description: "All outcomes in one queue: a red line (Ben → deny), a likely mistake (Tamar → send back), an unusual request (Dana → approve smaller), and routine ones.",
    requests: [redLineRequest, mistakeRequest, trapRequest, routineRequests[0], routineRequests[1], routineRequests[5]],
  },
  {
    id: "incident",
    label: "3 · P1 incident",
    short: "Incident",
    description: "An on-call SRE needs 8 resources (mixed levels) to fix an outage, with 18 min to SLA. Tests urgency plus a mixed-risk request.",
    requests: [incidentRequest, routineRequests[1], routineRequests[3], routineRequests[5]],
  },
];
