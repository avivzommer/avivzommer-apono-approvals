# 00 · Intro: what Apono is, in plain words

## The company
- **Apono** is an Israeli startup that makes **cloud-native privileged access management (PAM)** built around **just-in-time (JIT) access**.
- **June 2026:** acquired by **1Password** in a reported $250–300M deal. This is 1Password's move from passwords into *access governance for humans, machines and AI agents* ([SecurityWeek](https://www.securityweek.com/1password-acquires-apono-in-reported-250m-300m-deal/), [BusinessWire](https://www.businesswire.com/news/home/20260615694209/en/1Password-Pioneers-Access-Governance-for-Humans-Machines-and-AI-Agents-with-Acquisition-of-Apono)).
- **Positioning:** "zero standing privileges". Nobody holds permanent permissions. Access is created when someone needs it, scoped to the task, and revoked automatically ([apono.io](https://www.apono.io/)).
- **Who buys it:** security, IAM, and DevOps/platform teams. **Who uses it every day:** engineers, as requesters, and their managers or resource owners, as approvers.
- **Integrations:** cloud providers (AWS, GCP, Azure), databases, Kubernetes, IdPs (Okta and others), Slack / Teams / CLI for requesting, on-call / incident tools for shift-based approvers, and Jira.

## Glossary (plain language)
| Term | Meaning |
|---|---|
| **Standing privilege** | Permanent access someone keeps "just in case". This is the main risk Apono removes. |
| **JIT access** | Access granted only when needed, for a limited time, then revoked automatically. |
| **Least privilege / JEP** | Give the *smallest* permission that gets the job done ("just-enough privileges"). |
| **Access flow** | An admin-defined policy: *who* can request *what*, *who* approves, for *how long*, and with which conditions (MFA, justification). |
| **Requester / grantee** | The person asking for access, and the person who will use it (usually the same person). |
| **Approver** | A user, group, **manager**, **resource owner**, or **on-call shift member** set on the access flow. |
| **View / Edit / Own** | Access levels from the brief, roughly read-only, read-write, and admin/full control. Risk goes up sharply from left to right. |
| **Break-glass** | Emergency access during an incident, usually faster and audited more heavily. |
| **Access request vs. access review** | A *request* is a one-off ask, which is our scope. A *review* or *certification* is a periodic check of who still has access. |
| **Audit evidence** | What SOC 2 / ISO 27001 auditors ask for: who got access to what, when, for how long, who approved it, and why. |

## How a request works in Apono today (from the docs)
1. An engineer requests access through **Slack** (`/apono request`), **Teams**, the **CLI**, the **web portal**, or **Apono Assist** (AI, natural language).
2. The access flow decides whether the request is **auto-approved** or goes to **approvers**. Approvers can be configured as **ANY OF** groups (one approver from any group) or **ALL OF** groups (one approver per group), with **escalation** every X minutes or hours.
3. The approver sees: request ID, requester, integrations, resource types, duration, and justification. Permissions and resources are behind **"More details"** ([Slack approval docs](https://docs.apono.io/docs/access-requests-and-approvals/slack/approving-access-with-slack)).
4. In the **portal**, the approver goes to My Tasks → Pending Approval → clicks a row → a details panel opens → Approve/Reject. An optional **reason (under 124 characters)** can be required ([Portal approval docs](https://docs.apono.io/docs/access-requests-and-approvals/web-portal/approving-access-with-web-portal)).
5. Access is granted and later revoked automatically. Requests left pending for **more than 7 days fail automatically**. An admin can **force-approve** a request, and that is recorded in the timeline.

**What this means for the brief:** the decision data exists, but the specifics an approver needs to judge risk (which permissions on which resources) are **one click deep**. The only friction mechanism is a short free-text reason applied the same way to every request. That's a good starting point for the research questions.

## Market neighbours (one line each)
- **ConductorOne (C1):** identity governance + JIT, with strong Slack approvals.
- **Opal:** access requests with risk context and on-call approvers.
- **Entitle (BeyondTrust):** JIT for production and cloud.
- **Sym, Indent:** developer-first, Slack-native approvals.
- **AWS TEAM:** AWS's open-source temporary elevated access tool.
- **Microsoft Entra PIM, Google PAM:** cloud-native PIM.
- **CyberArk, SailPoint, Okta IGA:** enterprise incumbents.
