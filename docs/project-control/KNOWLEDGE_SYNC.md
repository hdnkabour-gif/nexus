# Shared knowledge and release contract (F26, F27, F42)

Status: DESIGNED / documentation. Not a live connector or a release approval.
This extends the existing project-control README and NEXUS IDEA-010, IDEA-037, IDEA-038; do not create a competing feature or evidence register. Read the existing idea log, feature catalog and approved ADRs; reconcile the portfolio registers in PR #18/#19 before using them as a current snapshot.

## Mandatory handoff for every coding or review session
At start: read the application README, existing agent instructions, docs/project-control/README.md, relevant decisions and open issues/PRs. Claim one scope with exact base/head SHA, task ID, owner and acceptance criteria. Do not duplicate an active task.
At end: record a redacted handoff in the application's existing issue/PR or approved project-control record, even if the task is unfinished. A chat answer alone is not durable evidence. Use the template below. If the only copy is in a conversation, the owner/agent must explicitly submit the relevant redacted decisions or findings; no connector may claim access to every conversation. A model without write permission must provide the handoff to the owner rather than report it saved.

## Canonical data and revision rules
- GitHub is the source of code, approved decisions and shareable engineering evidence; CI runs are execution evidence; Railway deployment metadata is operational observation. Customer acceptance, private business records and raw conversations remain outside the public repository.
- Preserve existing IDs (including PF-*, D-*, R-*, TE-*, IDEA-*) and aliases. Use app_id + existing record ID as logical identity. If no ID exists, assign once after reviewing semantic duplicates and pending PRs; source identity is provider + repository + immutable source locator/revision. Do not use text similarity alone to overwrite a decision. Never silently replace prior evidence.
- Record an observation time, source revision, exact SHA where applicable, evidence class, status and related IDs. Store revisions append-only; link superseded records. Identical source revisions are no-ops. Conflicting claims enter a review queue; old arrivals must not replace newer observations.
- Evidence classes: OWNER_STATED, HISTORICAL, CODE_PRESENT, CI_WORKFLOW, NAMED_TEST, DEPLOYMENT_METADATA, RUNTIME_SMOKE, ISOLATED_RESTORE, BUSINESS_ACCEPTANCE. UNKNOWN is not success or failure. Evidence from one class cannot certify another.
- Reuse applicable tests; changes to covered code, dependencies, schema, permissions, environment, or release requirements may invalidate evidence. Never bypass required CI. Distinguish review, merge, deploy and real-data approval.
- Only authorized, deliberately redacted operational metadata is eligible for NEXUS. No raw chat, customer/patient/employee records, secret values, private documents, sensitive vulnerability details or employer telemetry without authorization. Enforce allowlists and authorization before import, not after publishing. Do not send raw private sources to public GitHub or AI providers.

## Handoff template
```yaml
schema_version: 1
app_id: "<existing application identifier>"
task_id: "<existing issue/record ID>"
agent_role: "coordinator|executor|independent-reviewer"
state: "in_progress|blocked|review_requested|complete"
base_sha: "<full commit SHA or UNKNOWN>"
head_sha: "<full commit SHA or UNKNOWN>"
scope: "<redacted bounded task>"
source_refs: ["<authorized issue/PR/commit link>"]
related_ids: []
decisions: []
features: []
risks: []
evidence: [] # named tests/run IDs/observed_at/SHA/environment/result, no sensitive output
reused_evidence: [] # ID + impact justification
not_verified: []
next_action: "<one concrete action>"
release: "NOT_APPROVED" # approvals tracked separately
```

## NEXUS integration acceptance (existing F26/F27/F42)
1. Read the approved portfolio register and existing monitor-core contracts; preserve legacy snapshot as history. Migrate the UI off hard-coded six-app inventory only after validating canonical app IDs and access rules. Do not change count assertions merely to hide drift. Respect employer exclusions.
2. Build a protected Knowledge Center: authorized application filter, Ideas/Decisions/Risks/Features/Evidence/Releases/Handoffs, linked original IDs, revision history, source and freshness, review queue for duplicates/conflicts. Metadata only. Arabic RTL and French.
3. Ingest explicitly approved redacted records from GitHub and approved private sources using scoped server-only read credentials and idempotent checkpoints. Private source access requires explicit authorization; raw conversation import is not automatic. Missing access becomes UNKNOWN; bounded retries. No state-changing product operations.
4. Make automated sync status separate from application deployment status. Compare main vs deployed SHA per environment/service; distinguish CI result vs named test vs acceptance. Notify only on new relevant changes. Preserve review/merge/deploy/real-data gates independently.
5. Tests: duplicate import/no-op, out-of-order observations, conflict review, ID aliases, missing permission, malformed input, rejected non-allowlisted fields, cross-app access, UI search/filter/freshness, provider outage, and unchanged existing inventory/probe/auth semantics. Synthetic fixtures only. No live secrets or production databases.
6. Deliver in small PRs with exact head, tests and rollback. Independent reviewer checks privacy, provenance and all gate transitions. Do not merge or deploy without separate release authorization.

## Model assignments
Coordinator: recover historical records, map existing IDs, update private knowledge pages and prepare bounded tasks.
Executor (Claude Code or equivalent): implement the Knowledge Center incrementally against existing F26/F27/F42; read current heads and open PRs first; begin with redacted schema and fixtures, then protected UI, then authorized read-only sync. Save handoffs in GitHub.
Independent reviewer (Astra/Codex or equivalent): independently compare source/ID mappings and latest head, audit security and regression evidence; classify confirmed findings vs hypotheses. Review only, no overlapping implementation. All findings must cite a source and proposed verification. Do not redo passed tests unless applicable impact or mandatory CI requires it.
