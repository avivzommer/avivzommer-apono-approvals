# 05 · How products help people decide: patterns to borrow

**Goal:** understand decision-making UX as a craft, separate from security expertise. Then pick the few ideas that make this solution stand out as a designer's answer, not a security engineer's.

---

## 1. First, what is the approver's actual job?
Not "approve or reject." The job is:

> **"Make sure the right person gets the right access for the right amount of time, without becoming the bottleneck."**

That framing matters. It opens up answers other than yes or no: *less access, less time, a rule so I never see this again, someone else decides.* Most decision UX in great products works by **changing the shape of the decision**, not by making the yes/no buttons nicer.

## 2. Why decisions go wrong (the 5 forces)
| Force | What it does to people | In our case |
|---|---|---|
| **Volume** | People stop thinking and run on autopilot | 10 requests look alike → rubber-stamping |
| **Missing context** | People guess or delay | "What does Own on RDS even mean?" |
| **Irreversibility** | People freeze or avoid deciding | "I can't undo it" → the request sits for days |
| **No baseline** | People can't tell normal from strange | Is this usual for Dana? For the team? |
| **No feedback** | People never learn if they decided well | Approve, and never find out what happened |

Every pattern below fixes one or more of these forces.

---

## 3. Decision patterns, borrowed from everywhere

### A. Triage: don't treat every decision the same
- **Hospital ER triage** (color tiers), **Gmail Priority Inbox**, **Stripe Radar** (rules handle most payments, people review a small queue), **content moderation queues**.
- **Principle:** sort before you decide. People's attention is the scarce resource, so spend it only where it matters.
- **In our prototype:** Option A's two lanes. ✅ Already there.

### B. Decide the policy once, not the request a thousand times
- **Gmail** "filter messages like this", **Airbnb Instant Book** (hosts set rules once, then trusted guests book without asking), **Ramp/Brex** auto-approve within policy, browser **"Always allow"** for permissions.
- **Principle:** a decision you make over and over is a *rule waiting to be written*. The best approval UX gradually **removes approvals**.
- **For us:** after Maya approves *View billing-logs* for the Payments team for the 3rd time, suggest: **"Auto-approve this for your team next time?"** ⭐ *New idea, high impact on volume (requester speed).*

### C. Frame it as one clear question
- **Uber/Lyft driver request card:** one card with only the facts that decide it (pickup, distance, fare) and a timer. **Airbnb booking request:** who the guest is, reviews, verified ID. **Bank alert:** "Was this you? $340 at Best Buy."
- **Principle:** turn a pile of data into *the one question* and the 3 facts that answer it.
- **For us:** "Dana wants to fully control prod-billing-db for 4 hours" plus one red reason. ✅ Mostly there. Could go further with a literal question: *"Should Dana be able to delete the billing database today?"*

### D. Compare to normal
- **Credit-card fraud** ("unusual for you"), **Google** "new sign-in from a new device", **LinkedIn** "12 mutual connections", **Strava** "faster than your usual".
- **Principle:** people judge better *relative to a baseline* than in absolute terms.
- **For us:** "0 of 9 teammates have this · Dana has never had it." ✅ There, but it could be **the** main visual signal ("Unusual for Dana / Normal for team").

### E. Make the irreversible smaller (reduce the blast radius)
- **Bezos' "one-way vs. two-way doors":** treat a decision with care only if it can't be reversed, otherwise move fast. **Gmail Undo Send.** **Spending limits** on company cards. **Airbnb "pre-approve"** (yes, with conditions).
- **Principle:** if you can't undo a decision, **make it smaller**, so saying yes is less scary than saying no.
- **For us:** the brief says decisions can't be reversed, but the *size* of the yes can change: **approve for 1 hour instead of 4, Edit instead of Own, read-only first**. Option B's "Lower to Edit" is this idea. ⭐ *This directly answers "irreversible" and is the strongest UX insight in the project.*

### F. Friction that matches the stakes
- **GitHub** "type the repo name to delete", **Stripe** live vs. test mode, **aviation checklists** and the **two-person rule**, **banking step-up auth** for big transfers.
- **Principle:** make easy things easy and dangerous things *deliberately slower*. Same friction everywhere becomes noise.
- **For us:** the confirmation only for full control. ✅ There.

### G. Always offer a third way
- **Calendar** Yes / Maybe / No, **GitHub** Approve / Comment / Request changes, **moderation** "escalate", **Airbnb** "message guest".
- **Principle:** forcing a binary choice under uncertainty causes either freezing or reflex yes.
- **For us:** Ask Dana. ✅ There. Could add **"Hand to someone who knows"** (the resource owner).

### H. Speed for the boring majority
- **Superhuman** keyboard triage, **Gmail** select-all with exceptions, **inbox-zero** progress, **Reddit mod queue**.
- **Principle:** batch what's safe, with an exception list you can see.
- **For us:** "Approve all 9" plus a summary before sending. ✅ There.

### I. Time and escalation
- **Uber** request countdown, **PagerDuty** escalation policies (no answer in 5 minutes → backup person), **SLA timers** in support tools.
- **Principle:** no decision should wait forever on one person.
- **For us:** "18 min left" ✅. Missing: **"Maya hasn't answered in 15 minutes → goes to the on-call lead"**, plus the requester seeing who has it and when. ⭐ *New idea for requester speed.*

### J. Close the loop: feedback after the decision
- **Expensify** receipts, **Duolingo/Strava** weekly recaps, **code review** post-merge stats, **Spotify Wrapped**.
- **Principle:** people get better at decisions when they *see the outcome*.
- **For us:** after access expires: **"Dana used 1 of 3 items. Next time, Edit would have been enough."** This teaches approvers *and* feeds least-privilege suggestions to admins. ⭐ *Creative, fresh in this field, and directly serves the admin's need for trust.*

### K. Recommendations, but careful
- **Netflix** "because you watched", **weather** "70% chance of rain", **medical decision support** shows its reasons.
- **Principle:** show *why* and *how sure*; never a bare verdict. Option C showed the risk: one click approved Own on production.
- **For us:** signals yes, verdicts no. ✅ Already a lesson from the A/B/C test.

### Why not Tinder?
Swiping is built for **fast, low-stakes, reversible, binary** choices, the opposite of our case. It pushes speed over thought, has no "maybe", and hides context. It's a good **anti-example** to mention: it's exactly what rubber-stamping looks like as a UI.

---

## 4. Mapping to the brief's three problems
| Brief problem | Patterns that answer it | Status in prototype |
|---|---|---|
| **Requester needs speed** | A Triage · B Policy once · H Batch · I Escalation | A, H ✅ · **B, I ⭐ new** |
| **Approver needs urgency + confidence, low load** | C One question · D Baseline · E Smaller yes · F Friction · G Third way | C, F, G ✅ · D partial · **E ⭐ (B's "Lower")** |
| **Admin needs trust** | J Close the loop · audit "what was shown" · K Signals, not verdicts | audit, K ✅ · **J ⭐ new** |

## 5. The ideas that would elevate the solution (designer's signature)
1. **"Approve smaller" instead of yes/no** (E): every decision panel offers *less time / lower level / fewer items*. This turns an irreversible yes into a small, safe yes. *(Borrowed from spending limits, Airbnb pre-approve.)*
2. **"Make it a rule"** (B): repeated routine approvals become an auto-approve suggestion, so the queue shrinks over time. *(Borrowed from Gmail filters, Airbnb Instant Book.)*
3. **"Unusual for Dana" as the headline signal** (D): one comparison that replaces a list of facts. *(Borrowed from fraud detection.)*
4. **Escalation timer** (I): the requester is never stuck on one person. *(Borrowed from PagerDuty.)*
5. **"How did it go?" receipt** (J): after access ends, show what was actually used. *(Borrowed from Expensify/recaps.)*

**Suggested scope for the prototype:** 1 + 2 + 3 inside the winning flow (they fit the existing screens). 4 + 5 as "future" slides or a light mock, to show product thinking without overbuilding.

**Story for the panel:** *"I didn't design better approve buttons. I changed the shape of the decision: sort it (triage), shrink it (approve smaller), remove it (make it a rule), and learn from it (receipt)."*
