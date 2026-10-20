# 03 · Concepts: diverge → score → pick 3

Six concepts that are **genuinely different**. Each takes a different position on the axes the research raised: unit of work (queue / one request / per resource), how risk is communicated, how friction scales, how irreversibility is handled, and who proposes the decision.
Lo-fi wireframes: [concepts-wireframes.html](concepts-wireframes.html) (`#A`…`#F`), with PNGs in `screenshots/concepts/`. All six are also on the FigJam board under Concepts.

| | Concept | Thesis | Unit of work | Irreversibility handled by |
|---|---|---|---|---|
| **A** | **Risk-lane inbox** | "Most of your queue is routine. Clear it in one reviewed batch, and give your full attention to the 2 that matter." | The queue, split into *Needs attention* / *Routine* lanes | Stage the routine batch → summary → Submit (S4) |
| **B** | **Focus mode** | "One clear card per request, with what it grants, how risky it is and whether it's normal. Decide, then the next card loads." | One request at a time, keyboard (A/L/?/R, J) | Risk-specific confirmation on the card |
| **C** | **Per-resource review** | "Requests mix safe and risky items. Decide each resource, narrow the level where it's too much, and see exactly what you're granting before you submit." | Each resource in a request (partial approval, D6) | Live "You're granting 8 of 9" summary → Submit |
| **D** | **Recommendation-first** | "Every request already has an explained recommendation. Accept the ones you agree with in bulk, and override the rest." | The system's recommendation list | Bulk "Accept 11 recommendations" |
| **E** | **Risk-adaptive friction** | "The same screen asks for more as the risk goes up: one tap for low risk, a summary for medium, and an explicit acknowledgement for high risk." | One request, with UI that changes by risk tier | Friction scaled to risk: acknowledgement + required reason for high risk |
| **F** | **Conversation-first** | "Most bad approvals come from missing context. Make asking cheap, and let the decision happen inside the conversation." | A thread per request | Clarifying first, then "Approve as Edit" |

## Scores (1–5, security-weighted rubric from D14; max 55)
| Criterion (weight) | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| C1 Time to decide, routine (×1.25) | **5** | 4 | 2 | 5 | 3 | 2 |
| C2 Risk salience (×1.5) | **5** | 4 | 4 | 3 | **5** | 3 |
| C3 Decision confidence (×1) | 4 | **5** | 4 | 3 | 4 | 4 |
| C4 Cognitive load (×1) | 4 | **5** | 3 | 4 | 4 | 3 |
| C5 Scales 1→10 resources & a queue of 15 (×1) | **5** | 3 | 4 | 5 | 2 | 2 |
| C6 Urgency visibility (×1.25) | **4** | **4** | 2 | 3 | 3 | 3 |
| C7 Audit evidence (×1.5) | 4 | 4 | **5** | 3 | **5** | **5** |
| C8 Rubber-stamp resistance (×1.5) | 4 | 4 | **5** | 2 | **5** | 3 |
| C9 Edge cases (×1) | 3 | 4 | **5** | 3 | 3 | **5** |
| **Weighted total** | **46.75** | **45.0** | **42.0** | 37.0 | 43.0 | 36.75 |

### Why each scored the way it did
- **A, risk-lane inbox:** best at volume and at making risk stand out (lanes are a funnel the approver can see, S1 + S3). Weaker on edge cases. Risk: a mixed request (8 safe + 1 Own on prod) has to be split across lanes or it pulls the whole request into "attention".
- **B, focus mode:** best confidence and lowest load (all T1 data on one card, P3). Fast with keyboard shortcuts. One-at-a-time slows down long routine queues (C5).
- **C, per-resource review:** strongest rubber-stamp resistance and audit (every grant is an explicit item, and you can narrow the level, as in Teleport). It's the only concept that really handles mixed-risk requests. It's slow for routine approvals and doesn't address the queue or urgency on its own.
- **D, recommendation-first:** fast, but **automation bias (A-5)** turns one click into 11 decisions, and the evidence of what the human actually judged is weak. It breaks P2 ("explain, don't give a verdict") once it's bulk-accepted.
- **E, risk-adaptive friction:** excellent salience and audit, but it's a *mechanism*, not a whole experience. It says nothing about the queue (C5 = 2).
- **F, conversation-first:** great evidence and edge cases. Too slow as the default path, and it moves the burden to async chat (C1, C5).

## Market validation (Aviv's rule: no option that isn't on the market)
Each concept is checked against shipped products, using vendor docs and screenshots on the board.
✅ = the core interaction ships in identity/security tools · ⚠️ = parts ship, parts are borrowed from other domains · ❌ = not found.

| Concept | Verdict | Where it ships (IGA / security) | What's NOT on the market |
|---|---|---|---|
| **A · Risk-lane inbox** | ✅ **Validated** | **ConductorOne** review assistant: "approve all low-risk", **46 staged, 2 high-risk excluded** ([docs](https://www.c1.ai/docs/product/how-to/review-tasks)) · **Entra** recommendation column + "Accept recommendations" ([docs](https://learn.microsoft.com/en-us/entra/id-governance/perform-access-review)) · **SailPoint** "Automatically approve recommended items" ([docs](https://documentation.sailpoint.com/identityiq/help/certifications_and_access_reviews/manage_certs/scheduling_a_targeted_cert.html)) · **Opal** auto-approves safe requests, escalates the rest · **Vanta** "Needs attention / Overdue / Due soon" buckets | Showing the split as two *visible lanes* is our composition of these shipped parts |
| **B · Focus mode** | ⚠️ **Partial** | One-request decision cards ship everywhere: **Apono / Okta / Opal / Entitle Slack approval cards**, the **Entra** per-user details panel, **AWS TEAM** "View details", Okta's 2025 "Redesigned approver experience" (email / Slack / web ticket) | **Keyboard-driven sequential triage (A/R/J) isn't in any IGA tool.** It's borrowed from moderation and support tools (Reddit mod queue, Plain, Superhuman) |
| **C · Per-resource review** | ✅ **Validated (strongest)** | **SailPoint IdentityIQ**: "decision on each individual approval item", Approve All / Deny All / Forward, a recommendation icon per item ([docs](https://documentation.sailpoint.com/identityiq/help/lifecycle_manager/app_access_req.html)) · **ConductorOne** per-entitlement ✓/✕ · **Teleport** approve a *narrower role* than requested ([docs](https://goteleport.com/docs/identity-governance/access-requests/oss-role-requests/)) · **Opal** per-resource | Nothing. A live "granting 8 of 9" summary is a small addition |
| **D · Recommendation-first** | ✅ **Validated (market standard)** | **Entra**, **SailPoint AI-Driven Identity Security**, **ConductorOne** Copilot, **Okta Governance Analyzer**, **Opal Paladin** | Nothing. *Our objection is evidence-based (automation bias, A-5), not that it doesn't exist* |
| **E · Risk-adaptive friction** | ⚠️ **Partial** | Ships as **admin-set policy per resource/role**: **Entra PIM** per-role MFA / justification / approval · **SailPoint** Adaptive Approvals, required comments, **e-signature** · **Apono** "Require approver reason" + MFA per access flow · **Okta** justification settings | A single approval screen that *changes its UI by risk tier* isn't shipped as a concept. It's a mechanism |
| **F · Conversation-first** | ⚠️ **Partial** | **Okta OIG** request types: question steps assigned to the requester or others, web ticket ([Okta](https://support.okta.com/help/s/article/OIG-Access-Requests-Can-an-Approver-Supply-Information-for-a-Request?language=en_US)) · **SailPoint** per-item comments + Forward · **Entra** "Don't know" | A thread as the *primary* approval UI exists in service desks (Jira SM, Plain), not in IGA approvals |

**What changes:** A, C and D are fully on the market. B's core (a single-request decision card) is on the market, but its keyboard-first framing isn't, so it's **re-scoped as a "decision card"** if chosen. E and F stay **shared mechanisms**, which is how the market ships them too: policy-level friction and info requests.

## Recommendation for Checkpoint 4
Pick **A, B and C**. They represent **three real trade-offs in the unit of work**:
- **A (the queue):** optimizes throughput at the queue level.
- **B (the request):** optimizes the depth of a single decision.
- **C (the resource):** optimizes granular control and evidence.

What happens to the other three:
- **E becomes a shared mechanism in all three options:** high-risk items always get the specific acknowledgement (P1, P4).
- **F becomes a shared mechanism:** "Ask for info" is available in all three (D7, P4).
- **D is rejected as a concept,** but its *explained signal* survives as a **signal, not a verdict**: we show "1 of 9 teammates" and never a bare "Approve" (P2).

Because the shared components (signals, the acknowledgement for high risk, ask-for-info, audit record) are the same in all three, **the A/B/C comparison tests only the unit-of-work choice**.

## ✅ Checkpoint 4 decision
| Prototype option | Concept | Unit of work | Market anchor |
|---|---|---|---|
| **Option A** | Risk-lane inbox (concept A) | The queue | C1 assistant, Entra, SailPoint, Opal |
| **Option B** | Per-resource review (concept C) | The resource | SailPoint IIQ, C1, Teleport |
| **Option C** | Recommendation-first (concept D) | The system's proposal | Entra, SailPoint AI, C1 Copilot, Okta GA |

Shared in all three (so the comparison is fair): explained signals (P2), a specific acknowledgement for high-risk items (E → P1/P4), ask for info (F → P4), the decision record (P5), and an email entry with urgency (P1).
Hypothesis to test: **Option C will be fastest but weakest on C8 (rubber-stamp resistance)**. A and B should catch the risky "trap" request.
