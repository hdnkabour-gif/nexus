# 11 — Modern UX, workflows and operator experience

## Design language
NEXUS = mission-control style, but readable and calm. Dark/light mode, clear typography, accessible contrast, thoughtful color limited to actual warning states. Arabic RTL and French UI first, optional English. Responsive desktop-first investigative canvas and mobile emergency summary. Never hide warnings behind animation.

## Information hierarchy
1. Portfolio Pulse — top operational risks, SLO failures, status confidence and last evidence timestamp.
2. Applications — search/filter by domain, owner, stage, environment, technology, issue count.
3. App 360 — architecture, dependencies, source routes/models, deployments, connection status, backups, policy, history.
4. Incidents & Investigations — chronological evidence, severity, hypotheses, runbooks and assignable actions.
5. Actions & Approvals — explicit confirmation and preflight proof, running status/unknown reconciliation.
6. Knowledge & Assistant — evidence-scoped Q&A with source links and safe next probe.
7. Security & Audit — account access, secrets existence and rotation, alerts, change history.
8. Settings — integration connections, policy registry, on-call/shift schedules, language/theme.

## Essential workflows
**App registration**: discover repo -> detect stack/environment -> classify data -> approve manifest -> connect read-only -> validate first events -> mark active.

**Incident triage**: alert -> correlation -> named owner -> evidence timeline -> safe diagnostic -> suspected root cause + counterevidence -> runbook -> resolution check -> postmortem.

**Account support**: support ticket -> human identity verification by product owner -> scoped temporary grant -> step-up MFA -> send reset link/unlock -> verify local auth status -> expiration/audit.

**Risky change**: choose exact app+env -> preview target -> check recent backup/restore test -> request independent approval -> queue signed command -> show running/result/UNKNOWN -> independently verify.

**Release check**: target commit -> required tests -> migrations compatibility -> backup health -> change impacts -> staging smoke -> protected production promotion.

## UX components
- Portfolio cards show environment and last checked time, not just green badges.
- App relationship explorer with drilldown (app -> environment -> service -> route/job -> dependency -> incident).
- Global keyboard search over **authorized metadata only**.
- Incident evidence diff and event time axis, with a toggle for observed vs inferred facts.
- Side-by-side last-good vs current deploy route/config summary; configuration values redacted.
- Diagnostics decision tree (yes/no/unknown), with source runbooks.
- Action sheet listing exact target, scope, effects, preconditions, reversibility, operator and approver.
- Support search by ephemeral opaque reference, never names from central customer database.
- Localization of labels, RTL typography, keyboard/screenreader compatibility, reduced-motion support.
- Clear error states: unavailable, permission denied, stale evidence, connection degraded, outcome unknown.
- Notifications grouped by correlation, on-call routing, emergency-only escalation and acknowledgment.

## Operational cadence
- Daily: backup-age, last restore test, critical deployment failures, data integrity checks and overdue incidents.
- Weekly: software dependency risk, unused connections, stale runbooks, top incident causes, cost/saturation.
- Monthly: restore drill, access review, expired credentials, recovery goals and cross-app stability trends.
- After every deployment: smoke, error regression, migrations health, crucial scheduling/backup checks.

## UX anti-patterns
No fake live data. No one-click destructive fix. No ambiguous 'fixed' after a timeout. No generic terminal in admin UI. No default access to customer/patient records. No automatic action based only on an AI suggestion.
