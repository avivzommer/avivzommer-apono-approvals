import type { AccessRequest, Level, Resource } from "./data";

import { approver } from "./data";
import { envLabel, requestRisk, resourceRisk } from "./risk";

/** Plain-language copy: one sentence per request, max three reasons. */

const verb: Record<Level, string> = { view: "view", edit: "edit", own: "fully control" };

const kind: Record<Resource["type"], string> = {
  "S3 bucket": "storage bucket",
  "RDS database": "database",
  "EKS namespace": "service",
  "IAM role": "permission role",
  "DynamoDB table": "table",
  Lambda: "function",
  Secret: "secret",
  "CloudWatch logs": "logs",
  "SQS queue": "queue",
};

const order = { low: 0, medium: 1, high: 2 } as const;

export const first = (req: AccessRequest) => req.requester.name.split(" ")[0];

/** The riskiest resource in a request: the one the headline is about. */
export const mainResource = (req: AccessRequest) =>
  [...req.resources].sort((a, b) => order[resourceRisk(b)] - order[resourceRisk(a)] || b.level.localeCompare(a.level))[0];

export const resourcePhrase = (r: Resource) => `${r.name} (${envLabel[r.env]} ${kind[r.type]})`;

/** "wants to fully control prod-billing-db (production database) for 4 hours" */
export function headline(req: AccessRequest) {
  const main = mainResource(req);
  const others = req.resources.length - 1;
  return {
    verb: verb[main.level],
    level: main.level,
    resource: resourcePhrase(main),
    rest: others > 0 ? `+ ${others} more ${others === 1 ? "item" : "items"}` : "",
    duration: duration(req.durationH),
  };
}

/** Up to three short reasons why a request needs attention, most serious first. */
export function reasons(req: AccessRequest, max = 3): string[] {
  const out: string[] = [];
  const main = mainResource(req);
  const name = first(req);
  for (const r of [...req.resources].sort((a, b) => order[resourceRisk(b)] - order[resourceRisk(a)])) {
    if (r.level === "own" && r.env === "prod") out.push(`Full control of a production ${kind[r.type]}, including deleting it`);
    else if (r.level === "edit" && r.env === "prod") out.push(`Can change live production data`);
    if (r.sensitive && r.env === "prod") out.push(`Holds ${r.sensitive === "credentials" ? "production credentials" : `${r.sensitive} data`}`);
  }
  if (main.grantedBefore === 0 && main.level !== "view") out.push(`${name} has never had this access`);
  if (main.peersWithLevel === 0 && main.level !== "view") out.push(`No one on your team has this access`);
  else if (main.peersWithLevel === 1 && main.level !== "view") out.push(`Only 1 of ${approver.teamSize} teammates has this`);
  if (!req.ticket && requestRisk(req) !== "low") out.push(`No ticket linked`);
  if (req.durationH > 8) out.push(`Longer than usual (${req.durationH}h)`);
  return [...new Set(out)].slice(0, max);
}

/** One short line for a routine row: what, in plain words. */
export function routineLine(req: AccessRequest) {
  const main = mainResource(req);
  const others = req.resources.length - 1;
  return `${verb[main.level][0].toUpperCase()}${verb[main.level].slice(1)} ${main.name}${others ? ` + ${others} more` : ""}`;
}

/** Short reasons for a single item (Option B). */
export function itemReasons(r: Resource, name: string): string[] {
  const out: string[] = [];
  if (r.level === "own" && r.env === "prod") out.push(`Full control of a production ${kind[r.type]}, including deleting it`);
  else if (r.level === "edit" && r.env === "prod") out.push("Can change live production data");
  if (r.sensitive && r.env === "prod") out.push(r.sensitive === "credentials" ? "Production credentials" : `Holds ${r.sensitive} data`);
  if (r.grantedBefore === 0 && r.level !== "view") out.push(`${name} has never had this access`);
  if (r.peersWithLevel === 0 && r.level !== "view") out.push("No one on your team has this access");
  return out.slice(0, 2);
}

export const itemLine = (r: Resource) => `${verb[r.level][0].toUpperCase()}${verb[r.level].slice(1)} ${resourcePhrase(r)}`;

export const lowerLevel: Record<Level, Level | null> = { own: "edit", edit: "view", view: null };

export const itemVerb = (r: Resource) => `${verb[r.level][0].toUpperCase()}${verb[r.level].slice(1)}`;

/**
 * The one thing that makes a request risky, as a sentence (the only red on the card),
 * plus up to two supporting facts shown in neutral text.
 */
export function flag(req: AccessRequest): { main: string; consequence: string; supporting: string[] } | null {
  if (requestRisk(req) === "low") return null;
  const main = mainResource(req);
  const name = first(req);
  // Lead with the main resource's own reason so the title and the consequence talk about the same thing.
  const lead = itemReasons(main, name)[0];
  const all = [...new Set([lead, ...reasons(req, 4)].filter(Boolean))];
  const consequence =
    main.level === "own" && main.env === "prod"
      ? `${name} could delete ${main.name} or change who has access to it.`
      : main.level === "edit" && main.env === "prod"
        ? `${name} could change live data in ${main.name}.`
        : main.sensitive
          ? `${main.name} holds ${main.sensitive} data.`
          : `More access than ${name} usually has.`;
  return { main: all[0], consequence, supporting: all.slice(1, 3) };
}

/** Same, for a single item (Option B). */
export function itemFlag(r: Resource, name: string): { main: string; supporting: string[] } | null {
  const all = itemReasons(r, name);
  return all.length && resourceRisk(r) !== "low" ? { main: all[0], supporting: all.slice(1) } : null;
}


export const duration = (h: number) => (h >= 24 ? `${Math.round(h / 24)} days` : `${h} hour${h > 1 ? "s" : ""}`);

const levelWord: Record<Level, string> = { view: "read access", edit: "edit access", own: "full control" };
const levelShort: Record<Level, string> = { view: "Read", edit: "Edit", own: "Full control" };

export type Tier = "normal" | "unusual" | "mistake" | "notAllowed";

export interface Explanation {
  tier: Tier;
  /** Short tier label shown as the chip. */
  label: string;
  /** One plain sentence: what's different. Someone with no context should understand it. */
  title: string;
  /** Why that matters, in plain words. */
  why: string;
  /** "Compared to normal" row: what the team usually gets vs. what was asked. */
  compare?: { usual: string; asked: string };
  /** Extra facts, neutral. */
  facts: string[];
  /** What the requester can do instead (deny / send back). */
  instead?: string;
}

/**
 * Compare-to-normal model. Quiet when a request matches what the team normally gets;
 * when it doesn't, the difference itself is the flag, said in one plain sentence.
 */
export function explain(req: AccessRequest): Explanation {
  const name = first(req);
  const main = mainResource(req);

  if (req.redLine) {
    return { tier: "notAllowed", label: "Not allowed", title: req.redLine.title, why: req.redLine.why, facts: req.context ?? [], instead: req.redLine.instead };
  }
  if (req.mistake) {
    return { tier: "mistake", label: "Looks like a mistake", title: req.mistake.title, why: req.mistake.why, facts: [], instead: req.mistake.suggestion };
  }
  if (requestRisk(req) === "low") {
    return { tier: "normal", label: "Normal for your team", title: routineSentence(req), why: "", facts: [] };
  }

  const who =
    main.peersWithLevel === 0
      ? `No one on your team has ${levelWord[main.level]} on ${main.name}.`
      : `Only ${main.peersWithLevel} of ${approver.teamSize} teammates have ${levelWord[main.level]} on ${main.name}.`;
  const why =
    main.level === "own"
      ? `Full control means ${name} could delete it or change who can use it.`
      : main.env === "prod"
        ? `Edit access means ${name} could change live production data.`
        : `It's more access than ${name} usually gets.`;
  const facts: string[] = [];
  if (main.grantedBefore === 0) facts.push(`${name} has never had this before`);
  if (main.sensitive) facts.push(`It holds ${main.sensitive} data`);
  if (!req.ticket) facts.push("No ticket linked");
  return {
    tier: "unusual",
    label: "Unusual for your team",
    title: who,
    why,
    compare: req.usual
      ? { usual: `${levelShort[req.usual.level]} · ${duration(req.usual.durationH)}`, asked: `${levelShort[main.level]} · ${duration(req.durationH)}` }
      : undefined,
    facts,
  };
}

function routineSentence(req: AccessRequest) {
  const main = mainResource(req);
  return `${main.peersWithLevel} of ${approver.teamSize} teammates already have this${main.grantedBefore ? `, and ${first(req)} had it ${main.grantedBefore}× before` : ""}.`;
}

/** The "approve smaller" version: main resource at the usual level, for the usual time. */
export function smallerVersion(req: AccessRequest) {
  if (!req.usual) return null;
  const main = mainResource(req);
  return { level: req.usual.level, durationH: req.usual.durationH, label: `Approve as ${levelShort[req.usual.level]} · ${duration(req.usual.durationH)}`, main };
}
