import type { AccessRequest, Scenario } from "./data";
import type { DecisionRecord, Grant, OptionId, Outcome } from "./decisions";
import type { Screen } from "./components/Chrome";

import { Toast, toast } from "@heroui/react";
import { useState } from "react";

import { AuditLog } from "./components/AuditLog";
import { ControlBar, PortalShell } from "./components/Chrome";
import { DecisionPanel } from "./components/DecisionPanel";
import { EmailScreen } from "./components/EmailScreen";
import { RationaleContext } from "./components/Why";
import { scenarios } from "./data";
import { grantsOf, newRecordId } from "./decisions";
import { OptionA } from "./flows/OptionA";
import { OptionB } from "./flows/OptionB";
import { OptionC } from "./flows/OptionC";
import { explain, smallerVersion } from "./plain";
import { requestRisk, routineReason } from "./risk";

const explainShown = (req: AccessRequest) => {
  const e = explain(req);
  return `${e.label}: ${e.title}${e.compare ? ` (usual ${e.compare.usual} vs asked ${e.compare.asked})` : ""}`;
};

/** Deep links for demos and screenshots: ?option=A&scenario=trap&screen=portal&rationale=1&open=REQ-4830 */
const params = new URLSearchParams(window.location.search);
/** ?embed=1 hides the prototype controls (used by the presentation deck). */
const embedded = params.has("embed");
const initialScenario = (scenarios.find((s) => s.id === params.get("scenario"))?.id ?? "trap") as Scenario["id"];
const initialOpen = scenarios.find((s) => s.id === initialScenario)!.requests.find((r) => r.id === params.get("open")) ?? null;

export default function App() {
  const [option, setOption] = useState<OptionId>((["A", "B", "C"].includes(params.get("option") ?? "") ? params.get("option") : "A") as OptionId);
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>(initialScenario);
  const [screen, setScreen] = useState<Screen>((["email", "portal", "audit"].includes(params.get("screen") ?? "") ? params.get("screen") : "email") as Screen);
  const [rationale, setRationale] = useState(params.get("rationale") === "1");
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  /** Decided request per option+scenario, so each option starts from the same queue. */
  const [decided, setDecided] = useState<Record<string, DecisionRecord>>({});
  const [asked, setAsked] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<AccessRequest | null>(params.get("option") === "B" ? null : initialOpen);

  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  const key = (reqId: string) => `${option}:${scenarioId}:${reqId}`;
  const scoped = <T,>(map: Record<string, T>) =>
    Object.fromEntries(scenario.requests.filter((r) => map[key(r.id)]).map((r) => [r.id, map[key(r.id)]]));
  const decidedHere = scoped(decided);
  const askedHere = scoped(asked);
  const pendingCount = scenario.requests.filter((r) => !decidedHere[r.id]).length;

  const record = (
    req: AccessRequest,
    outcome: Outcome,
    method: string,
    reason?: string,
    extraShown: string[] = [],
    split?: { granted: Grant[]; denied: Grant[]; durationH?: number },
  ) => {
    const rec: DecisionRecord = {
      id: newRecordId(),
      requestId: req.id,
      option,
      scenario: scenario.label,
      at: new Date(),
      requester: req.requester.name,
      outcome,
      granted: split?.granted ?? (outcome === "approved" ? grantsOf(req) : []),
      denied: split?.denied ?? (outcome === "rejected" ? grantsOf(req) : []),
      durationH: split?.durationH ?? req.durationH,
      risk: requestRisk(req),
      reason,
      method,
      shown: [explainShown(req), ...extraShown].filter(Boolean),
      isTrap: req.isTrap,
    };
    setRecords((rs) => [...rs, rec]);
    if (outcome !== "info requested") setDecided((d) => ({ ...d, [key(req.id)]: rec }));
    return rec;
  };

  const first = (req: AccessRequest) => req.requester.name.split(" ")[0];

  const actions = {
    onApprove: (req: AccessRequest, reason?: string) => {
      const rec = record(req, "approved", "Individual review", reason);
      setOpen(null);
      toast.success(`Approved · ${first(req)} notified · ${rec.id}`);
    },
    onReject: (req: AccessRequest, reason: string) => {
      const rec = record(req, "rejected", "Individual review", reason);
      setOpen(null);
      toast.success(`Rejected · ${first(req)} sees your reason · ${rec.id}`);
    },
    onApproveSmaller: (req: AccessRequest) => {
      const sm = smallerVersion(req)!;
      const granted = req.resources.map((r) => ({ resource: r.name, env: r.env, level: r === sm.main ? sm.level : r.level }));
      const rec = record(req, "partially approved", "Approved smaller (team's usual level and time)", `${sm.label.replace("Approve as ", "Lowered to ")}`, [], { granted, denied: [], durationH: sm.durationH });
      setOpen(null);
      toast.success(`${sm.label.replace("Approve as", "Approved as")} · ${first(req)} notified · ${rec.id}`);
    },
    onSendBack: (req: AccessRequest, message: string) => {
      const rec = record(req, "sent back to fix", "Sent back to requester", message);
      setOpen(null);
      toast.success(`Sent back to ${first(req)} with your note · ${rec.id}`);
    },
    onAsk: (req: AccessRequest, question: string) => {
      record(req, "info requested", "Question to requester", question);
      setAsked((a) => ({ ...a, [key(req.id)]: question }));
      setOpen(null);
      toast.success(`Question sent to ${first(req)}. Nothing granted yet.`);
    },
  };

  const batchApprove = (reqs: AccessRequest[]) => {
    reqs.forEach((req) => record(req, "approved", `Staged batch of ${reqs.length} (routine lane)`, undefined, [`Routine lane: ${routineReason(req)}`]));
    toast.success(`${reqs.length} approvals submitted · requesters notified`);
  };

  /** Option B: a decision per resource (approve, narrow, or deny each item). */
  const itemDecision = (req: AccessRequest, granted: Grant[], denied: Grant[], reason?: string) => {
    const narrowed = granted.some((g) => req.resources.find((r) => r.name === g.resource && r.env === g.env)?.level !== g.level);
    const outcome: Outcome = granted.length === 0 ? "rejected" : denied.length || narrowed ? "partially approved" : "approved";
    const rec = record(req, outcome, "Per-item review", reason, [], { granted, denied });
    toast.success(`${outcome[0].toUpperCase()}${outcome.slice(1)} · ${first(req)} notified · ${rec.id}`);
  };

  /** Option C: bulk-accept the system's "approve" recommendations. */
  const acceptRecommendations = (reqs: AccessRequest[]) => {
    reqs.forEach((req) => {
      const deny = req.recommendation.verdict === "deny";
      record(req, deny ? "rejected" : "approved", `Accepted recommendation (bulk of ${reqs.length})`, deny ? req.recommendation.reason : undefined, [`Recommendation: ${req.recommendation.verdict}: ${req.recommendation.reason}`]);
    });
    toast.success(`${reqs.length} recommendations accepted · requesters notified`);
  };

  const reset = () => {
    setDecided({});
    setAsked({});
    setRecords([]);
    setOpen(null);
    setScreen("email");
  };

  return (
    <RationaleContext.Provider value={rationale}>
      <div className="flex h-full flex-col">
        <Toast.Provider placement="bottom end" />
        {embedded ? null : (
        <ControlBar
          option={option}
          rationale={rationale}
          scenario={scenario}
          scenarios={scenarios}
          screen={screen}
          setOption={(o) => {
            setOption(o);
            setOpen(null);
          }}
          setRationale={setRationale}
          setScenario={(id) => {
            setScenarioId(id);
            setOpen(null);
          }}
          setScreen={setScreen}
          onReset={reset}
        />
        )}

        {screen === "email" ? (
          <div className="min-h-0 flex-1 overflow-auto">
            <EmailScreen scenario={scenario} onOpen={() => setScreen("portal")} />
          </div>
        ) : (
          <PortalShell active={screen === "audit" ? "audit" : "portal"} pending={pendingCount} onNavigate={setScreen}>
            {screen === "audit" ? (
              <AuditLog records={records} />
            ) : option === "A" ? (
              <OptionA asked={askedHere} decided={decidedHere} scenario={scenario} onBatchApprove={batchApprove} onOpen={setOpen} />
            ) : option === "B" ? (
              <OptionB asked={askedHere} decided={decidedHere} initialOpen={initialOpen?.id} scenario={scenario} onAsk={actions.onAsk} onDecide={itemDecision} onSendBack={actions.onSendBack} />
            ) : (
              <OptionC asked={askedHere} decided={decidedHere} scenario={scenario} onAccept={acceptRecommendations} onOpen={setOpen} />
            )}
          </PortalShell>
        )}

        <DecisionPanel actions={actions} req={open} onClose={() => setOpen(null)} />
      </div>
    </RationaleContext.Provider>
  );
}
