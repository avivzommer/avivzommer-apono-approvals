import type { OptionId } from "../decisions";
import type { Scenario } from "../data";

import { Bell, BranchesRight, ChevronDown, ChevronRight, CircleQuestion, Cloud, Gear, ListCheck, Magnifier, Shield, SquareListUl } from "@gravity-ui/icons";
import { Button, Kbd } from "@heroui/react";

import { approver } from "../data";
import { optionMeta } from "../decisions";
import { UserAvatar } from "./Ui";

export type Screen = "email" | "portal" | "audit";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; title?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide text-white/50 uppercase">{label}</span>
      <div className="flex rounded-lg bg-white/10 p-0.5" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            aria-pressed={value === o.id}
            className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
              value === o.id ? "bg-white text-[#1e1e1e]" : "text-white/80 hover:bg-white/10"
            }`}
            title={o.title}
            type="button"
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Prototype controls (not part of the product): option, scenario, screen, rationale. */
export function ControlBar({
  option,
  setOption,
  scenario,
  scenarios,
  setScenario,
  screen,
  setScreen,
  rationale,
  setRationale,
  onReset,
}: {
  option: OptionId;
  setOption: (o: OptionId) => void;
  scenario: Scenario;
  scenarios: Scenario[];
  setScenario: (id: Scenario["id"]) => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
  rationale: boolean;
  setRationale: (v: boolean) => void;
  onReset: () => void;
}) {
  return (
    <div className="shrink-0 bg-[#1e1e1e] text-white">
      <div className="flex items-center gap-x-5 gap-y-2 overflow-x-auto px-3 py-2 sm:flex-wrap">
        <span className="shrink-0 text-xs font-semibold">
          <span className="me-1.5 rounded bg-[#7c3aed] px-1.5 py-0.5 text-[10px] tracking-wide uppercase">Prototype</span>
          Apono approvals
        </span>
        <Segmented
          label="Option"
          options={(["A", "B", "C"] as OptionId[]).map((id) => ({ id, label: `${id} · ${optionMeta[id].short}` }))}
          value={option}
          onChange={setOption}
        />
        <Segmented
          label="Scenario"
          options={scenarios.map((s) => ({ id: s.id, label: s.short, title: s.description }))}
          value={scenario.id}
          onChange={setScenario}
        />
        <Segmented
          label="Screen"
          options={[
            { id: "email", label: "Email" },
            { id: "portal", label: "Portal" },
            { id: "audit", label: "Audit log" },
          ]}
          value={screen}
          onChange={setScreen}
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs">
          <input checked={rationale} className="accent-[#7c3aed]" type="checkbox" onChange={(e) => setRationale(e.target.checked)} />
          Show rationale
        </label>
        <button className="shrink-0 text-xs text-white/60 underline-offset-2 hover:text-white hover:underline" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className="border-t border-white/10 px-3 py-1.5 text-[11px] text-white/60">{scenario.description}</div>
    </div>
  );
}

const navGroups = [
  {
    label: "Access",
    items: [
      { id: "portal", icon: ListCheck, label: "Approvals" },
      { id: "requests", icon: SquareListUl, label: "My requests" },
      { id: "audit", icon: Shield, label: "Activity" },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "flows", icon: BranchesRight, label: "Access flows" },
      { id: "integrations", icon: Cloud, label: "Integrations" },
      { id: "settings", icon: Gear, label: "Settings" },
    ],
  },
] as const;

/** The Apono portal frame: B2B app shell. Sidebar on desktop, compact top bar on mobile. */
export function PortalShell({
  active,
  pending,
  onNavigate,
  children,
}: {
  active: "portal" | "audit";
  pending: number;
  onNavigate: (s: Screen) => void;
  children: React.ReactNode;
}) {
  const crumb = active === "audit" ? "Activity" : "Approvals";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f6f6f7] md:flex-row">
      <aside className="hidden w-60 shrink-0 flex-col px-3 py-3 md:flex">
        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-black/[0.04]" type="button">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-sm font-bold text-white shadow-sm">a</span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">Acme Corp</span>
            <span className="truncate text-[11px] text-muted">Apono · AWS</span>
          </span>
          <ChevronDown className="ms-auto size-4 text-muted" />
        </button>

        <button
          className="mt-3 flex h-8 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-xs text-muted shadow-[0_1px_0_rgba(0,0,0,0.03)]"
          type="button"
        >
          <Magnifier className="size-3.5" /> Search
          <Kbd className="ms-auto text-[10px]">
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>K</Kbd.Content>
          </Kbd>
        </button>

        {navGroups.map((g) => (
          <nav key={g.label} className="mt-5 flex flex-col gap-0.5">
            <span className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted uppercase">{g.label}</span>
            {g.items.map(({ id, icon: Icon, label }) => {
              const on = active === id;
              return (
                <button
                  key={id}
                  aria-current={on ? "page" : undefined}
                  className={`flex h-8 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors ${
                    on ? "bg-surface font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-border" : "text-foreground/70 hover:bg-black/[0.04]"
                  }`}
                  type="button"
                  onClick={() => (id === "portal" || id === "audit" ? onNavigate(id) : null)}
                >
                  <Icon className={`size-4 ${on ? "text-[#4f46e5]" : "text-muted"}`} />
                  {label}
                  {id === "portal" && pending ? (
                    <span className="ms-auto rounded-full bg-[#4f46e5] px-1.5 text-[11px] font-semibold text-white tabular">{pending}</span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        ))}

        <div className="mt-auto flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-black/[0.04]">
          <UserAvatar initials={approver.initials} name={approver.name} size="sm" />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{approver.name}</span>
            <span className="truncate text-[11px] text-muted">{approver.role}</span>
          </div>
        </div>
      </aside>

      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 md:hidden">
        <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-sm font-bold text-white">a</span>
        <span className="text-sm font-semibold">Apono</span>
        <div className="ms-auto flex items-center gap-1">
          <Button size="sm" variant={active === "portal" ? "secondary" : "ghost"} onPress={() => onNavigate("portal")}>
            Approvals{pending ? ` · ${pending}` : ""}
          </Button>
          <Button size="sm" variant={active === "audit" ? "secondary" : "ghost"} onPress={() => onNavigate("audit")}>
            Activity
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:my-2 md:me-2 md:overflow-hidden md:rounded-xl md:border md:border-border md:bg-surface md:shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="hidden h-12 shrink-0 items-center gap-2 border-b border-border px-5 text-sm md:flex">
          <span className="text-muted">Access</span>
          <ChevronRight className="size-3.5 text-muted" />
          <span className="font-medium">{crumb}</span>
          <div className="ms-auto flex items-center gap-1">
            <Button isIconOnly aria-label="Help" size="sm" variant="ghost">
              <CircleQuestion className="size-4" />
            </Button>
            <span className="relative">
              <Button isIconOnly aria-label="Notifications" size="sm" variant="ghost">
                <Bell className="size-4" />
              </Button>
              {pending ? <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-[#4f46e5] ring-2 ring-surface" /> : null}
            </span>
          </div>
        </div>
        <main className="min-h-0 flex-1 overflow-auto bg-surface">{children}</main>
      </div>
    </div>
  );
}
