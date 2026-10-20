# 07 · Flag mechanism: compared to normal

FigJam: section **"10 · Flag mechanism"**. Prototype: scenario **Mixed** (`?scenario=mixed&screen=portal`).

**Principle:** if a request matches what the team usually gets, it stays **quiet**. If it doesn't, **the difference is the flag**, said in one plain sentence that someone with no context understands.

| Tier | Color | When | Plain-language template | Example | Default action |
|---|---|---|---|---|---|
| **Normal** | Quiet gray | Matches what the team usually has | "N of 9 teammates already have this, and {name} had it N× before." | "8 of 9 teammates already have this, and Noa had it 6× before." | Approve (batch) |
| **Unusual for your team** | Amber | More than the team normally gets | "No one on your team has {level} on {resource}." + "{Level} means {name} could {consequence}." + **Usual vs. This request** | "No one on your team has full control on prod-billing-db. Full control means Dana could delete it." · Usual: Edit · 1 hour / This request: Full control · 4 hours | **Approve smaller** |
| **Looks like a mistake** | Blue | The request contradicts its own reason or history | "{name} asked for X, but this looks like Y." + why + suggested fix | "Tamar asked for production, but this looks like test work." → "Did you mean checkout-assets-dev?" | **Send back to fix** (not a rejection) |
| **Not allowed** | Red | Crosses a policy red line | "This would give {name} {red-line thing}." + why it's never allowed + what to do instead | "This would give Ben admin rights in production." → "Ask for the specific resource, with a ticket." | **Deny** (reason pre-filled) |

## Copy rules for every flag
1. Say **what's different**, not what's wrong ("No one on your team has…").
2. Say the **consequence in everyday words** ("…could delete it").
3. Show the **baseline next to the request** (Usual vs. This request).
4. **One flag per request.** Supporting facts are gray, never extra flags.
5. Every deny and send-back says **what to do instead**.

## Where it lives in the prototype
- **Inbox (Option A):** each card shows the tier chip and one sentence. Sorted: urgent first, then Not allowed → Mistake → Unusual.
- **Decision panel (shared by A and C):** full flag (sentence, consequence, Usual vs. This request, facts, what to do instead). The main button changes with the tier: *Approve* / *Approve as Edit · 1 hour* / *Send back to fix* / *Deny*.
- **Option B:** the same flag card above the per-item decisions, plus Send back for mistakes.
- **Audit log:** stores the tier and sentence that were shown ("Unusual for your team: … (usual Edit · 1 hour vs. asked Full control · 4 hours)").
