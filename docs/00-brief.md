# 00 · Brief, constraints, assumptions

## Hard constraints (from the brief)
- B2B, complex, data-heavy, **self-serve** (must be intuitive without training)
- Customer: 1,000 employees, Apono used for **AWS** access
- Each request covers **1–10 resources**, each at **view / edit / own**
- The approver is notified **by email**, which leads to the **portal**, where they decide
- The decision is **irreversible**
- Problems: requesters need speed · approvers need urgency + confidence + low load (or they ignore or rubber-stamp) · admins need trust for audit

## Tensions
1. **Speed vs. scrutiny:** a faster decision tends to be a shallower one.
2. **Low effort vs. accountability:** fewer clicks vs. a meaningful audit record.
3. **Ignoring ≠ rubber-stamping:** two different failure modes with different causes (low urgency vs. low perceived risk / habituation).
4. **Irreversible + low context = anxiety:** this pushes approvers either to stall or to approve on reflex.

## Assumptions (to confirm at Checkpoint 1 / with Apono)
| # | Assumption | Status |
|---|---|---|
| A1 | Primary approver persona = **Eng manager** | ✅ Decided at CP1 (assumption, confirm with Apono) |
| A2 | Partial approval (per resource) | 🔀 **Explore both**: becomes an axis across Options A/B/C |
| A3 | Approver can **ask for more info** before deciding | ✅ Decided at CP1 (assumption, confirm with Apono) |
| A4 | Apono has resource sensitivity / environment tags (prod vs. dev) | Likely (resource types and integrations exist) |
| A5 | Requester history is available (past requests, approvals) | Likely (activity log exists) |
| A6 | A justification field exists and can be required | ✅ Confirmed in docs |
| A7 | The approval reason can be required (under 124 characters) | ✅ Confirmed in docs |
| A8 | Pending requests fail after 7 days; escalation is configurable | ✅ Confirmed in docs |

## Questions to send Apono (draft, for Aviv to send)
> Hi team, thanks again. A few quick questions so my assumptions are explicit:
> 1. Who are your typical approvers: line managers, resource owners, or security/on-call? Is there one most common profile?
> 2. Can an approver approve part of a request (some resources) and reject the rest?
> 3. Can an approver ask the requester for more information before deciding?
> 4. Roughly how many requests does an approver handle per week, and what's the current median time-to-decision?
> 5. What context is available per resource (environment/prod tags, data sensitivity, owner) and per requester (history, team)?
>
> If any of these aren't answerable, I'll state my assumptions in the presentation. Thanks! Aviv
