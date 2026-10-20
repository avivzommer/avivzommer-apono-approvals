# 06 · Approve, approve smaller, or deny?

FigJam: section **"9 · Approve vs Deny"** on the [board](https://www.figma.com/board/Bf8CZDeQ9fjI8meFipogn2/Apono).

**Key insight:** not every risky request is a "no". Most risky requests should be **approved smaller**. A few cross a **red line** and must be denied. The UI has to tell these two apart and explain why.

## Deny-worthy red flags (real-world patterns)
| Flag | Example |
|---|---|
| 🔑 **Power to grant power** | Asks for IAM admin or Apono admin, so they could give themselves anything later |
| 📏 **Scope ≫ task** | "Fix a typo in a log message" → asks for Own on the production IAM role |
| 🧍 **Personal data, no need** | Reads production customer PII "for testing" (staging has masked data) |
| 🕑 **Wrong context** | Contractor whose contract ends Friday · request at 02:14 from a new country |
| ⚖️ **Conflict of duties** | Wants to edit the prod payments DB *and* approve their own deploys |
| 📝 **Weak justification** | "need access" · no ticket · 7 days on production |
| 🔁 **Duplicate / just rejected** | Already has active access, or resubmitted unchanged after a rejection |

**Two tiers of risk:**
- **"Look closer" (amber):** unusual but often fine → offer **Approve smaller**.
- **"Red line" (red):** policy says no → **Deny is the default**, with a reason and a way forward.

## The approver's 4 questions (decision tree)
1. **Does it cross a red line?** Yes → **Deny** (with a reason and a way forward).
2. **Does it match the stated task?** No → **Ask** (if it's unclear) or deny (if it's clearly unrelated).
3. **Is it normal for this person and team?** Yes → **Approve** (batch it if it's routine).
4. **Would less access or less time do the job?** Yes → **Approve smaller**. No → **Deny**, or hand it to the resource owner.

## Three flows
| Step | ✅ Approve: Noa | 🟠 Approve smaller: Dana | ⛔ Deny: Ben |
|---|---|---|---|
| Request | View billing-logs (prod) · 2h · PAY-1182 | Own prod-billing-db · 4h · "debug failed migration" · no ticket | Contractor (ends Friday) · Own payments-admin IAM role · 7 days · "need access" · no ticket · 02:14 |
| Arrives | Email: "Plus 9 routine…" → Routine lane | Email: "1 needs your review" → top lane | Email: "1 needs your review" → top lane, marked **Red line** |
| UI shows | No red: read-only · 8/9 teammates · granted 6× · ticket matches | One red line: "Full control of a production database. Dana could delete it." | One red line: "Could grant himself any access in production." |
| 4 questions | No · Yes · Yes · Yes | No · Partly · No · **Yes** | **Yes**, so stop |
| Action | "Approve all 9" → summary → Submit (2 clicks) | One tap: **Lower to Edit + 1h instead of 4h** | **Deny is the primary button**; reason chips pre-filled from the flags |
| Requester | Slack message, access for 2h, auto-revoked | "Approved as Edit for 1h", unblocked | Sees why **and** what to do next: "Request View on the specific resource, with a ticket" |
| Audit | approved · batch · what was shown | partially approved · Own→Edit · 4h→1h · reason | rejected · reason · flag · **admin alerted** of an attempted escalation |
| UI lesson | No red, nothing to read. Speed *is* the feature | Make the safe yes easier than the risky yes | A red line flips the default: Deny becomes the main action, and every deny explains itself and offers a way forward |

## What this means for the prototype (proposed next changes)
1. **Two risk tiers in the UI:** "Look closer" (amber) vs. "Red line" (red). Today everything risky looks the same.
2. **Approve smaller in the decision panel:** lower the level and shorten the time, in one tap.
3. **Red line flips the default:** Deny becomes the primary button, with pre-filled reasons and a suggested alternative for the requester.
4. **Add a deny-worthy scenario** (Ben) to the prototype, so all three outcomes can be demoed.
