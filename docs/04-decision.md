# 04 · Decision: A vs. B vs. C

All three options run in the live prototype on the same shared base: email, decision panel, high-risk confirmation, ask for info, audit log. Only the **unit of work** differs.
Deep links: `?option=A|B|C&scenario=routine|trap|incident&screen=email|portal|audit`.

## How each one explains in a sentence
| Option | One sentence |
|---|---|
| **A · Inbox lanes** | "One request needs you; the rest are routine. Check them once and approve together." |
| **B · Per item** | "Open a request and decide each item: approve, lower, or deny. Then send." |
| **C · Recommendations** | "Apono suggests a decision for each request. Accept the suggestions and look at the rest." |

## Walkthrough results (prototype, by scenario)
| Scenario | A · Inbox lanes | B · Per item | C · Recommendations |
|---|---|---|---|
| **Routine** (6 low-risk) | Approve all 6 after one list check · **2 clicks** | Open and send each one · **~12 clicks** | Accept 6 · **2 clicks** |
| **Hidden risk** (Dana's Own on prod among 9 routine) | Dana is pulled out to "Needs your review" and **can't be batched**. Trap caught by design | Dana's risky item **starts undecided**, so a choice is forced. "Lower to Edit" is one tap. Trap caught | **"Accept 10" includes Dana**: recommended because "5 of 9 teammates access these resources". **Trap slips through** |
| **P1 incident** (8 items, 18 min left) | Time left shown first. All-or-nothing: approve Own on the IAM role (with confirmation), or ask/reject | Approve 7 safe items and lower the IAM role to Edit, which **unblocks the incident safely**, but 5 risky items each need a choice | Omer is "Recommended: review", so it falls back to the same panel as A |

## Rubric after building (1–5, security-weighted, max 55)
| Criterion (weight) | A | B | C |
|---|---|---|---|
| C1 Time to decide, routine (×1.25) | 5 | 2 | 5 |
| C2 Risk salience (×1.5) | 5 | 4 | 2 |
| C3 Decision confidence (×1) | 4 | 5 | 3 |
| C4 Cognitive load (×1) | 5 | 4 | 5 |
| C5 Scales to 10 items & a queue (×1) | 4 | 5 | 4 |
| C6 Urgency visible (×1.25) | 5 | 3 | 3 |
| C7 Audit evidence (×1.5) | 4 | 5 | 2 |
| C8 Rubber-stamp resistance (×1.5) | 5 | 5 | 1 |
| C9 Edge cases (×1) | 3 | 5 | 3 |
| **Weighted total** | **49.5** | **46.25** | **32.5** |

Changes from the concept scores (03-concepts): A went up after simplification (C4) and visible urgency (C6). C dropped once the trap was tested (C2, C7, C8): one click approved Own on production, and the record only says "accepted recommendation".

## Reading
- **A wins on the brief's core trade-off:** it's fast for the routine 90% and deliberate for the risky 10%.
- **B has the best control,** with partial approval and "lower the level", but it's slow for routine work.
- **C confirms the research (A-5, automation bias).** It's the market default, the fastest, and the one that lets the trap through.
- **Candidate for the final design:** A as the base, plus B's per-item "Approve / Lower / Deny" inside A's decision panel, only for mixed-risk requests (the incident case). Decision pending at Checkpoint 6.
