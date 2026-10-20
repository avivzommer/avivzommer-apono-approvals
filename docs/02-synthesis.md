# 02 · Synthesis → decision criteria

Inputs: [00-personas](00-personas.md), [01-research](01-research.md), decisions D1–D9.
This phase turns evidence into **criteria that every concept will be judged by**. There are still no solutions here.

---

## 1. Volume model (why this is a queue problem)
> These are assumptions to confirm with Apono. They frame the scale and aren't presented as fact.

| | Estimate | Basis |
|---|---|---|
| Employees / engineers who request access | 1,000 / ~350 | Typical SaaS ratio |
| Requests per engineer per day | 1–2 | JIT means zero standing access, so every task needs a request |
| **Org requests per day** | **~350–700** (thousands per week) | |
| Share auto-approved by policy | ~50–70% | S1 funnel (Opal, Teleport) |
| **Human decisions per eng manager per day** | **~5–15**, arriving in bursts | 8–10 reports, plus on-call peaks |

**So:** the approver's unit of work is **a queue that arrives in bursts, from email**. The single request is one item in that queue. A design that only perfects the one-request view fails at the 12th request of the day.

## 2. Jobs to be done
| Persona | When… | I want to… | So I can… |
|---|---|---|---|
| **Dana, requester** | I'm blocked on a task that needs AWS access | know who has my request, when I'll hear back, and why if it's rejected | get unblocked or fix and resubmit in minutes |
| **Eng manager, approver** (primary, D5) | a batch of requests lands while I'm between meetings | clear the routine ones fast and spot the one that actually needs thought | not block my team, and never be the one who approved "the breach" |
| **Ron, admin/auditor** | an auditor asks why someone had Own on prod | see who approved, what they saw, why, and for how long | prove least privilege and trust the process |

## 3. Request lifecycle journey (3 lanes)
| Stage | Requester (Dana) | Approver (manager) | Admin (Ron) | Where it breaks today |
|---|---|---|---|---|
| **1 Request** | Picks 1–10 resources × view/edit/own, adds a justification | — | Policy decides auto vs. human | Over-requesting ("give me Own") |
| **2 Notify** | Waits, with no ETA | **Email** among dozens of others | — | 🔴 **Ignored:** the email has no urgency, risk or context (W4 shows the better pattern) |
| **3 Open** | — | Lands in the portal, sees a list of similar-looking rows | — | 🟠 Every row looks the same, so there's no triage (S5) |
| **4 Understand** | — | Needs to answer "what exactly, is it risky, is it normal?" | — | 🔴 **Specifics one click deep** (W1/W2); no peer or history context (S2) |
| **5 Decide** | — | Approve or Reject only, on the whole request, irreversible | — | 🔴 **Rubber-stamp or stall:** no third way, no partial approval, the same treatment for every risk level (A-1, S6) |
| **6 Feedback** | Notified; if rejected, gets a ≤124-character reason or none | — | — | 🟠 Silent rejection, then a resubmit loop |
| **7 Audit** | — | — | Reviews the trail | 🔴 The reason says "ok". **What the approver saw isn't recorded** (D-1, A-4) |

**Moments that matter:** 2 (Notify → *ignored*), 4–5 (Understand/Decide → *rubber-stamped*), 7 (Audit → *untrustworthy*). These map exactly to the brief's three problems.

## 4. How might we…
- **HMW-1** make the email itself say how urgent and how risky the request is, so the right ones get opened first?
- **HMW-2** let a manager clear 10 routine requests in under a minute and still *catch* the one risky request?
- **HMW-3** show "what exactly does this grant, and is it normal for this person?" without a click?
- **HMW-4** give approvers a safe moment to review before an irreversible commit?
- **HMW-5** capture what the approver saw and why, as evidence, without making them type essays?
- **HMW-6** give a way out besides approve or reject (ask, reassign, approve less)?

## 5. Data inventory ranked by decision value
Ranked by how much each item changes the decision, weighed against how costly it is to show. Sources: competitor matrix, at-scale wall, SOC 2, personas.

| Tier | Where it lives | Data | Why | Source |
|---|---|---|---|---|
| **T1: at a glance** (row/card) | Inbox row + top of the decision view | **Who** (name, role, team, *is my report?*) | Managers judge the person first | Personas |
| | | **What, in plain language**: resource · **environment (prod/dev)** · **level (view/edit/own)** | The core of the risk; one click deep today | W1, C-2 |
| | | **Risk flags with reasons** ("Own on prod", "first time", "1 of 9 teammates has this", "sensitive data") | Explained risk is what drives the decision | W5, W8, A-5 |
| | | **Why**: justification + linked ticket/incident | Intent | Apono docs, PIM |
| | | **Waiting time / deadline** | Urgency | W11, W12 |
| **T2: one step** (expand/panel) | Decision view body | Duration requested | Long grants mean more risk | Apono flows |
| | | **Peer comparison** (x of y teammates have this) | "Is this normal?" | W5, Okta |
| | | **Requester history** (same resource before? last outcome?) | Repeat vs. first-time | S2 |
| | | **What the level allows**, in plain words ("Own = delete bucket, change policy") | Managers don't read IAM | Persona 2a |
| | | **Why it reached you** (which policy, why not auto-approved) | Builds trust in the funnel | S1 |
| | | Other approvers / stage history | Context, no double work | W10 |
| **T3: drill-down / audit** | Details / audit record | Raw ARN / IAM policy JSON, full timeline, requester's current access | Experts and auditors only | D-1 |

## 6. Design principles (5, merged at CP3; each traceable to evidence)
| # | Principle | Means | Evidence |
|---|---|---|---|
| **P1** | **Risk and urgency decide the path** | Routine requests are fast and can be batched. Risky ones look different and slow you down on purpose. Waiting time, deadline and consequence are visible from the email onward. | A-1 habituation, A-2 compliance budget, A-3 dual process, S1, S3, W11, W12 |
| **P2** | **Explain, don't give a verdict** | Every flag or recommendation carries its reason in plain words. No bare scores. | A-5 automation bias, W5, W8, W15 |
| **P3** | **What decides it is visible; details come on demand** | T1 data with no clicks. T2 one step away. T3 for experts. | A-7 progressive disclosure, C-2, W1 |
| **P4** | **Review before you commit, and always have a way out** | A clear "here's what you're about to grant" moment that scales with risk, plus ask for info, reassign, or approve less. | S4 (C1), A-6 design friction, S6, W10, Teleport |
| **P5** | **Every decision leaves evidence** | Automatically record what was shown + the decision + a reason when it's risky. Show this before the decision. | D-1 SOC 2, A-4 accountability |

## 7. Evaluation rubric (score 1–5 per concept; this is the yardstick from here on)
| Criterion | 1 = poor | 5 = excellent | Maps to |
|---|---|---|---|
| **C1 Time to decide (routine)** | > 60 s per request, one at a time | 10 routine requests in < 60 s | Requester problem, HMW-2, P1 |
| **C2 Risk salience** | A risky request looks like every other one | The risky request is impossible to miss, even in a batch | P1, approver problem |
| **C3 Decision confidence** | Has to guess or leave the page | Knows what, how risky and whether it's normal without leaving | P2, P3 |
| **C4 Cognitive load** | Raw data dump, IAM jargon | Plain language, chunked, T1/T2/T3 | P3, A-7 |
| **C5 Scales 1 → 10 resources & a queue of 15** | Breaks with mixed risk or volume | Mixed-risk request and long queue handled gracefully | D6, D9 |
| **C6 Urgency visibility** | No sense of time | Wait, deadline and consequence clear from email to decision | P1, HMW-1 |
| **C7 Audit evidence** | Click + "ok" | Who, what, level, duration, why, and what was shown are recorded | P5, admin problem |
| **C8 Rubber-stamp resistance** | Can approve risky requests in bulk with one click | Risky items need a deliberate, specific action | P1, P4, A-1 |
| **C9 Edge cases** | Not handled | Self-approval blocked, expired request, ask-info loop, partial approval | P4, C-5 |

> **Weighting (approved at CP3):** C2, C8 and C7 ×1.5 (the security reasons for the product existing). C1 and C6 ×1.25 (requesters being blocked). The rest ×1.
