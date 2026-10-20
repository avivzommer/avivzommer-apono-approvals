# 08 · Brief check: does the work answer every point?

| Brief says | How I answered it | Where | Status |
|---|---|---|---|
| **B2B, complex system** | A real B2B app shell (workspace, nav, tables, audit) built on HeroUI | Prototype · deck slide "Live prototype" | ✅ |
| **Large amount of data to admins and end-users** | Data in 3 tiers: one sentence at a glance → the flag → technical details on demand | Decision 03 · prototype panel | ✅ |
| **Self-serve, most intuitive UX** | Plain language anyone can read ("No one on your team has full control…"); no IAM jargon at first glance | Decisions 03–04 | ✅ |
| **1,000-employee company, AWS** | Volume model: ~350–700 requests a day, 5–15 per manager, in bursts; AWS resources (RDS, S3, EKS, IAM…) | Decision 01 · data | ✅ |
| **1–10 resources, view / edit / own** | Requests with 1 to 8 resources; level chips View / Edit / Own; the riskiest item leads | Prototype (incident: 8 items) | ✅ |
| **Approver can approve or reject** | Approve and Reject, plus two extras: *Approve smaller* and *Send back to fix* | Decision 05 | ✅ (+ extras) |
| **Notified by email → decides in the portal** | The email triages (what needs you, how urgent); the decision happens only in the portal | Prototype "The email" tab | ✅ |
| **Decision can't be reversed** | "Final once sent" before every decision; a summary before batch approval; an extra confirmation only for full control; *Approve smaller* shrinks the irreversible part | Decision 05 | ✅ |
| **Requesters need a fast decision** | Routine requests go in one reviewed batch; urgent ones go first; risky ones get a smaller yes instead of a no; every deny or send-back says what to do next | Decisions 02, 05 | ⚠️ Approver side only. The requester's own screen isn't designed (shown as notifications) |
| **Approvers need urgency** | Waiting time and "minutes left" on every request; incidents sorted first; time pressure has its own color | Decision 02 | ✅ |
| **…confidence** | "Compared to normal": usual for the team vs. this request | Decision 04 | ✅ |
| **…minimum cognitive load** | One sentence per request, one flag per request, everything else quiet | Decisions 03–04 | ✅ |
| **…otherwise ignore or rubber-stamp** | Tested: a risky request hidden in 9 routine ones. Sorting caught it; "accept all" let it through | Decision 02 | ✅ |
| **Admins need trust for audit** | Write-once record of who, what, level, duration, why, **and what the approver saw** | Decision 06 · audit log | ✅ |
| **Design 1 prototype** | One winning flow (A) in live code; B and C kept as explored alternatives | Deck | ✅ |
| **Best way to display the data** | Tiers + one sentence + compared to normal | Decisions 03–04 | ✅ |
| **May add features, focus on core needs** | Approve smaller, Send back to fix, batch routine, risk sorting. All serve the three problems | Decisions 02, 05 | ✅ |
| **Explain every UX decision** | 6 decisions in the deck, rationale mode in the prototype, a 26-entry decision log | Deck · docs/decision-log.md | ✅ |
| **How will you measure success?** | One metric per person plus a guardrail | Deck slide "Did it work?" | ✅ |
| **How would you test before development?** | Trap test, A vs. market default, plain-text read-back | Same slide | ✅ |

**One gap worth saying out loud:** I designed the approver's side. The requester sees outcomes as notifications ("Approved as Edit for 1 hour", "Sent back: did you mean dev?"), but their screen isn't designed. In the presentation, frame it as the next step.
