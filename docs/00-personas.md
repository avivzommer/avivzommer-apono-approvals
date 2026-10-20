# 00 · Personas

> **Sources:** Apono docs (approver types), practitioner threads (r/sysadmin, r/ITManagers), the vendor blog on "JIT exhaustion" (Andromeda), and the brief. Quotes are short excerpts from search results; open the links for full context. These are **proto-personas**: evidence-informed but not validated with Apono users. We'll say this openly in the presentation and list it as a test item.

---

## 1 · Requester: "Dana, Backend / DevOps engineer"
- **Context:** works on AWS daily. Has zero standing access because of JIT, so every prod debug, data fix, or deploy investigation starts with a request for 1–10 resources (S3 buckets, RDS, IAM roles, EKS…).
- **Goals:** get unblocked in minutes, not hours. Ask for the right scope the first time.
- **Frustrations:** waiting for an approver who's in meetings; rejections with no explanation; having to chase people on Slack; "approval theatre" that only slows things down.
- **At the decision moment they need:** to know who has the request, when to expect an answer, and why it was rejected so they can fix and resubmit.
- **How things go wrong for them:** blocked work, *over-requesting* ("give me Own so I don't have to ask again"), and going around the process.
- **Voice:** reviewers "lacking request context… rubber-stamp approvals… or demand more" (Andromeda Security blog).

## 2 · Approver: three types (Apono supports all of them)
| | **2a. Eng manager** | **2b. Resource / data owner** | **2c. Security / on-call** |
|---|---|---|---|
| **Knows** | The *person* and their project | The *resource* and how sensitive it is | *Risk* and policy, not the work itself |
| **Doesn't know** | What the AWS permission actually allows | Why this person needs it | The person and the business context |
| **Volume** | Low to medium, irregular | Medium | High, bursty during incidents |
| **Where they work** | Email, meetings, often on mobile | Slack / IDE | Slack, on-call pager |
| **Typical failure** | **Rubber-stamps** ("I trust my people") | **Ignores** (not their job) / over-blocks | **Alert fatigue** → rubber-stamps or blocks |

- **Shared goals:** decide quickly without becoming the blocker; never be the person who approved "the breach"; spend effort only when the request is risky.
- **Shared frustrations:** too many identical-looking requests; key details hidden behind clicks; no sense of what is normal for this person or team; decisions can't be undone, so there's anxiety without enough information.
- **Voice (practitioners):**
  - "The employee manager is always going to be a rubber stamp." ([r/sysadmin](https://www.reddit.com/r/sysadmin/comments/1rssv6s/approvers_of_access_requests_rubberstamping_them/))
  - "your manager will get prompt fatigue and just approve the requests" ([r/sysadmin](https://www.reddit.com/r/sysadmin/comments/1g0oa35/is_easy_to_impose_security_steps_when_you_are_not/))
  - "JIT exhaustion" (Andromeda Security blog)
- **Why this matters:** the brief's line "ignore or rubber stamp" is two failure modes. Managers tend to *rubber-stamp*, and owners or security tend to *ignore* or get fatigued. **Which approver we design for first changes the design**, so this is Checkpoint 1.

## 3 · Admin / auditor: "Ron, Security & GRC lead"
- **Context:** set up the Apono access flows. Answers to auditors (SOC 2, ISO 27001) and the CISO.
- **Goals:** every grant is justified, approved by the right person, time-boxed, and traceable. Prove least privilege.
- **Frustrations:** approvals with no reason ("ok", "approved"); approvers approving their own team's risky "Own" requests without thinking; having to *force-approve* stuck requests; no signal of approval quality.
- **At the decision moment they need** (indirectly): the decision record to capture *what the approver saw* and *why they decided*. A click alone isn't enough.
- **How things go wrong:** passing the audit on paper while risk is real, or tightening policy until engineers go around it.
- **Voice:** reviews where "managers are much more likely to rubber stamp an approval" are seen as "worse than not having approvals" ([r/sysadmin](https://www.reddit.com/r/sysadmin/comments/1tqe4zm/how_do_you_handle_an_access_review/)).

---

## Persona tension map
- **Dana wants speed. Ron wants scrutiny. The approver is stuck in the middle**, with the least context and the least time.
- **The design goal follows from this:** fast for low-risk requests, deliberate for risky ones, and every decision explainable after the fact.
