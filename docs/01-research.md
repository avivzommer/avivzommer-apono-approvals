# 01 · Research

Phase 1 sprint. Four sources: competitors (direct), analogs (same job, other domains, via Mobbin), domain/compliance, and academic research.
Each finding ends with **→ what it means for how we judge designs**. These are criteria, not solutions.

---

## 1. Direct competitors: how the approver sees a request

| Product | Entry point | What's above the fold | Risk signal | Justification | Bulk vs. per-item | Irreversibility | Ask for info | Audit |
|---|---|---|---|---|---|---|---|---|
| **Apono (today)** | Slack, Teams, portal, email | ID, requester, integration, resource *type*, duration, justification | None shown | Optional, can be required | Whole request | Plain Approve / Reject | ❌ | Timeline, plus optional reason (≤124 characters) |
| **ConductorOne (C1)** | Slack, web | Identity, entitlement, **peer** and **usage** context | **Risk context + AI recommendation** | Yes | Per entitlement | — | — | Strong ([AccessOwl comparison](https://www.accessowl.com/alternatives/conductorone-vs-accessowl)) |
| **Opal** | Slack, web | Requester, resource, **"Requester risk: Low"** | **Risk-tiered approval**; AI agent "recommends approve"; auto-approves safe requests and **escalates only what needs a human** ([opal.dev](https://www.opal.dev/)) | Yes | Per resource | — | — | Yes |
| **Entitle (BeyondTrust)** | Slack, Teams, Jira | Permission, duration, justification | **User risk as an approval condition** ([docs](https://docs.beyondtrust.com/entitle/docs/approval-workflows)) | Yes | Multi-stage (manager → owner → security) | — | — | Yes |
| **AWS TEAM** | **Email → web app** (same entry point as our brief) | List → "View details" → approve/reject ([AWS blog](https://aws.amazon.com/blogs/security/temporary-elevated-access-management-with-iam-identity-center/)) | None | Yes | Whole request | — | — | CloudTrail session log |
| **Entra PIM** | Email → Azure portal | Role, requester, justification | None | **The approver must write a justification too** ([MS Learn](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-approval-workflow)) | Per role | — | — | Yes |

**Takeaways**
- **C-1: The market is moving toward risk tiering.** Opal and C1 auto-approve low-risk requests and send only exceptions to people. → *Judge designs by whether a risky request clearly stands out from a routine one.*
- **C-2: The details an approver needs are often one click deep** (Apono, TEAM: "More details" / "View details"). → *Judge designs by how much decision-critical information is visible without clicking.*
- **C-3: Nobody does "ask for info" well.** It isn't a first-class action in any of these tools, so it's a gap we can fill (D7).
- **C-4: AI recommendations are appearing** (Opal, C1). That comes with automation-bias risk (see A-5). → *Any recommendation must be explained, not just stated.*
- **C-5: Self-approval is blocked everywhere** (Opal, TEAM, PIM). → *This is a required edge case.*

## 2. At-scale wall: how identity and security tools handle high-volume decisions

> **Round 2 (after Aviv's feedback):** the first wall mixed in consumer approvals (time off, Airbnb, Instacart). That missed the real challenge. **At organization level this is thousands of access decisions a day, so each approver faces a queue, not a single request.** This round uses identity-governance vendors' **own documentation** plus B2B queue and triage tools from Mobbin. Screenshots are on the FigJam board (Research → "At-scale wall").

| # | Source | What it shows | Pattern |
|---|---|---|---|
| W1 | **Apono (today)**, [portal docs](https://docs.apono.io/docs/access-requests-and-approvals/web-portal/approving-access-with-web-portal) | My Tasks list → click a row → details panel → Approve/Reject (+ reason ≤124 characters) | Baseline: specifics are one click deep |
| W2 | **Apono (today)**, [Slack docs](https://docs.apono.io/docs/access-requests-and-approvals/slack/approving-access-with-slack) | Request card, then "More details" for permissions and resources | Baseline |
| W3 | **SailPoint ISC**, [Approvals admin](https://documentation.sailpoint.com/saas/help/requests/approvals_admin.html) | Request queue with **Days old**, Assigned to, Pending/Concluded, bulk actions, Cards ↔ Table | Queue built for volume |
| W4 | **Microsoft Entra**, [Perform access review](https://learn.microsoft.com/en-us/entra/id-governance/perform-access-review) | Email with **one CTA ("Start review") + end date**; the decision happens in My Access | Email entry, same as our brief |
| W5 | **ConductorOne**, [Review tasks](https://www.c1.ai/docs/product/how-to/review-tasks) | Insights column with flags: **"1 out of 302 users in your organization have this entitlement"** → recommendation "Look closer" | Explained risk per row |
| W6 | **ConductorOne**, review assistant | "Approve all low-risk reviews for Slack" → **46 staged, 2 high-risk excluded** and left for a human | Bulk split by risk |
| W7 | **ConductorOne**, review list | Per-row ✓/✕ are **staged** (undo available), progress "54 of 175 decided", then **Submit reviews** | Decide ≠ commit |
| W8 | **Microsoft Entra**, user list | **Recommendation column with its reason**: "Deny: last sign-in date unknown", "Approve: signed in < 30 days" | Explained recommendation |
| W9 | **Microsoft Entra**, accept recommendations | Bulk accept: **"Previous decisions will not be changed. 1 recommendation will be accepted."** | Bulk that respects people's decisions |
| W10 | **Microsoft Entra**, multi-stage | **"Don't know"** option; stage-1 decision and reason shown to the stage-2 reviewer | Third outcome + history |
| W11 | **Vanta** (Mobbin) | "Needs attention: **Overdue / Due soon** / Needs remediation" counts | SLA buckets |
| W12 | **Vanta** (Mobbin) | Items to remediate: **"Due in 2 days"**, "SLA of 7 days" | Visible deadlines |
| W13 | **Plain** (Mobbin) | Queue states + keyboard: assign, **escalate**, next/previous (J/K) | Throughput |
| W14 | **Reddit mod queue** (Mobbin) | Approve (F) / Remove (D) / next item, built for high-volume moderation | Throughput |
| W15 | **AirOps** (Mobbin) | **"Reasoning" column per row** + accept/decline + bulk | Explained AI suggestion |
| W16 | **Square Risk Manager** (Mobbin) | Only payments matching rules (**moderate/high risk**) become alerts for a human | Rules funnel |
| W17 | **Sentry** (Mobbin) | Saved views filtered by **priority**, age, trend | Triage views |
| (text) | **Okta Identity Governance**, [Review campaigns](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/iga-ac-review-campaign.htm) | Governance Analyzer approve/revoke recommendations + insights, **reassign**, multi-select approve/revoke (if the admin allows it), justification settings | Recommendation + routing |
| (text) | **Teleport**, [Automatic reviews](https://goteleport.com/docs/identity-governance/access-requests/automatic-reviews/), [Role requests](https://goteleport.com/docs/identity-governance/access-requests/oss-role-requests/) | Access Automation Rules auto-review by role, user traits, resource labels; **approve a narrower role than requested** ("db-support, dba is not necessary") | Funnel + approve less |
| (text) | **Opal**, [changelog](https://docs.opal.dev/changelog/changelog) | Reviewers **rate the AI's (Paladin) decisions** from Slack | Feedback loop on automation |

### At-scale patterns (for Checkpoint 2)
| Pattern | Evidence | Status |
|---|---|---|
| **S1 Funnel:** policy auto-approves routine requests, humans see only exceptions | Opal, Teleport, Square rules, C1 | Industry standard. Apono has auto-approve per access flow, but the *approver* never sees why something reached them |
| **S2 Explained recommendation per row** | C1 "1 of 302", Entra "last sign-in unknown", AirOps reasoning | Standard in leading IGA. **Missing in Apono** |
| **S3 Bulk split by risk:** low-risk together, high-risk excluded | C1 assistant, Entra accept-recs | Differentiating |
| **S4 Decide ≠ commit:** stage, undo, submit | C1 | **Directly answers "the decision can't be reversed"** |
| **S5 Throughput queue:** SLA buckets, days-old, keys, saved views | Vanta, SailPoint, Plain, Reddit, Sentry | Standard for ops tools |
| **S6 Third outcome + routing:** don't know / reassign / escalate / approve narrower | Entra, Okta, Plain, Teleport | Common in IGA, **missing in Apono** |
| ⚠️ **Anti:** "approve all" with no risk split; uniform optional comment | Apono today (≤124-character reason) | Avoid |

## 3. Domain and compliance
- **D-1: SOC 2 CC6.2 / CC6.3.** Access must be *authorized before it's granted*, based on role, with **least privilege and segregation of duties** ([CC6 text](https://www.designcs.net/soc-2-cc6-common-criteria-related-to-logical-and-physical-access/)). Auditors ask for **access request history with approver identity and revocation timestamps** ([Teleport](https://goteleport.com/use-cases/soc2-compliance/)). → *The decision record must capture who, what, level, duration, when, why, and what the approver saw.*
- **D-2: The stakes.** Verizon DBIR 2025: **credential abuse is the #1 initial access vector (~22%)**, and credentials appear in **88% of basic web-app attacks** ([DBIR 2025 PDF](https://www.verizon.com/business/resources/reports/2025-dbir-data-breach-investigations-report.pdf), [Descope summary](https://www.descope.com/blog/post/dbir-2025)). The 2026 DBIR says vulnerabilities now edge out stolen passwords (31%). → *Over-granted access is a real attack surface, so rubber-stamping has a cost.*
- **D-3: Practitioners say manager approval is "always going to be a rubber stamp"** (r/sysadmin), and that reviewers without context either rubber-stamp or demand more ("JIT exhaustion", Andromeda). → *Our primary persona (the eng manager) is the most at risk.*

## 4. Academic evidence
| # | Source | Finding | → What it means for judging designs |
|---|---|---|---|
| A-1 | Anderson, Vance, Kirwan et al., *How Polymorphic Warnings Reduce Habituation in the Brain*, CHI 2015 ([ACM](https://dl.acm.org/doi/10.1145/2702123.2702322)); Vance et al., *Tuning Out Security Warnings*, MISQ 2018 ([MISQ](https://misq.umn.edu/misq/article/42/2/355/1716/Tuning-Out-Security-Warnings-A-Longitudinal)) | The brain's response drops after repeated warnings, and compliance fell over 3 weeks. **Warnings that change their appearance resist habituation.** | Treating every request the same trains approvers to stop reading. **Risky requests must look and feel different** from routine ones. |
| A-2 | Beautement, Sasse & Wonham, *The Compliance Budget*, NSPW 2008 ([ACM](https://dl.acm.org/doi/10.1145/1595676.1595684)) | People have a **limited budget** of security effort. Once it's spent, they work around controls. | **Don't spend approver effort on low-risk requests.** Save friction for the requests that need it. |
| A-3 | Kahneman, *Thinking, Fast and Slow* (2011) | Fast, intuitive System 1 vs. slow, deliberate System 2 thinking. | Routine requests can be decided fast. **High-risk requests should prompt deliberate thinking.** |
| A-4 | Lerner & Tetlock, *Accounting for the Effects of Accountability*, Psych. Bulletin 1999 ([PubMed](https://pubmed.ncbi.nlm.nih.gov/10087938/)) | **Accountability before the decision, to an unknown audience,** improves judgment when the bias comes from low effort. | Make it visible **before** deciding that the decision is recorded and reviewable. A reason helps only when it's meaningful. |
| A-5 | Parasuraman & Manzey, *Complacency and Bias in Human Use of Automation*, Human Factors 2010 ([PubMed](https://pubmed.ncbi.nlm.nih.gov/21077562/)) | People over-trust automated recommendations (commission and omission errors). | An unexplained "AI says approve" **increases** rubber-stamping. **Show the reasons, not a verdict.** |
| A-6 | Cox et al., *Design Frictions for Mindful Interactions*, CHI EA 2016 | Small, targeted friction can prompt mindful choices without hurting usability. | Friction is a tool when it's **targeted and proportional**, for example confirming exactly what an "Own on prod" grant allows. |
| A-7 | Sweller (cognitive load theory); NN/g, progressive disclosure | Working memory is limited; layering information reduces overload. | For 10 resources × 3 levels, **summarize first, details on demand**, grouped by risk. |

---

## Top 8 findings (round 2, for Checkpoint 2)
1. **Scale reframe:** an approver faces a queue, not one request. The design unit is **the inbox plus the decision**.
2. **Funnel first:** policy auto-approves routine access so people only see exceptions (Opal, Teleport, Square).
3. **Explain every recommendation inline, per row** ("1 of 302 users have this"). Never a bare score (C1, Entra; A-5).
4. **Bulk is safe only when it's split by risk:** the low-risk set together, high-risk excluded for full attention (C1, Entra).
5. **Decide ≠ commit:** staging decisions and then submitting gives a review moment before an irreversible action (C1).
6. **Throughput tools:** SLA buckets, days-old, J/K keys, saved views (Vanta, SailPoint, Plain, Reddit).
7. **A third outcome + routing:** don't know, reassign, escalate, approve narrower (Entra, Okta, Teleport).
8. **Habituation + compliance budget:** treating every request the same trains rubber-stamping (A-1, A-2). Audit needs who, what, level, why, and what the approver saw (D-1).
