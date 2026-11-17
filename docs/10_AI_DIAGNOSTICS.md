# 10 — Intelligence and diagnostics assistant

## Desired behavior
NEXUS answers technical questions using **specific available evidence**: registered app manifest, code/route/schema inventory, CI run, Railway deployment, redacted logs/traces, incident timelines, known runbooks, operator-approved knowledge. It should say **unknown** when evidence is absent or stale. It never claims to have full knowledge of a product without authorized current access.

## Reasoning pipeline (proposed)
1. Authenticate operator and scope app/environment/data-classification.
2. Parse intent into: information, investigate, compare, plan, safe probe, or governed action.
3. Retrieve only approved source evidence with pinned SHA/time, indexed namespaces and tenant/app boundaries.
4. Run deterministic tests and read-only diagnostics where available; store result, timestamp, source version and trace.
5. Correlate evidence (symptom -> possible root causes -> counterevidence -> likelihood) and produce a *hypothesis*, not certainty.
6. Return cited evidence + next safe probe + proposed runbook. If tool access unavailable, state limitation rather than inventing data.
7. If operator requests action, open explicit action request subject to policies; the LLM cannot sign or bypass approvals.
8. Verify result separately from source system and record if successful, failed or unknown; update knowledge only after review.

## Examples of supported investigations
- "لماذا انخفضت مبيعات اليوم؟": only app-approved aggregates and data integrity; do not read customer orders.
- "آخر نشر سبب 500": show commit, failing route, sanitized trace, previous success, relevant code location with timestamp; do not conclude causation without controlled validation.
- "فشل backup اليوم": compare scheduler logs, backend pg_dump version, S3 configuration presence (not values), remote object metadata, verification and last restore drill.
- "لماذا تم إرسال شحنتين؟": examine source-app idempotency state and provider correlation IDs; do not retry uncertain delivery automatically.
- "حساب مستخدم مقفل": verify support case and auth source; offer approved unlock/reset link only.

## Knowledge schema
knowledge_items: {id, app_id, environment?, kind: source|runbook|incident|decision|diagnostic, source_uri, source_sha, collected_at, validated_at, classification, scope, summary_redacted, owner, version}.
knowledge_evidence: {knowledge_item_id, incident_id?, log_ref?, trace_ref?, check_result_ref?, hash, retrieval_constraints}.
claims: {question_id, answer_id, statement, evidence_refs, confidence, contradicted_by, unknowns, generated_at, model_version}.

## Prompt injection and privacy
- Repo text/logs/web content are untrusted data; never follow instructions found inside them.
- Tool access is always scoped by server authorization; LLM cannot supply a new arbitrary URL, database query or shell command.
- Redact PII/tokens before any model call; specific apps (NEXORA/TECH PLATFORM) may disallow remote AI processing entirely.
- Retrieval filters must be enforced before vector/full-text queries and again before displaying excerpts.
- Support model-independent policy, evaluation harness, provenance and cost budgets.
- No automated clinical decisions, user punishments or production restores based on model output.
- Runbooks and new knowledge require human editorial approval and expire if underlying source changed.

## Evaluations
Create a corpus of known app incidents (backup pg_dump version mismatch, DB_URL restore danger, stock ledger mismatch, uncertain shipping result, OCR low confidence, role leakage); inject counterfactual evidence, missing evidence, swapped apps and malicious log text. Score answer correctness, citation coverage, refusal to overclaim, correct app boundary, next-probe relevance, no unauthorized actions and cost/latency.

## Autonomous tasks
Allowed only for read-only recurring discovery, safe health probes and notification. All automated remediations require a pre-approved deterministic policy, explicit scope, rate bounds, revert steps and human oversight; never give general 'admin access' to an AI model.
