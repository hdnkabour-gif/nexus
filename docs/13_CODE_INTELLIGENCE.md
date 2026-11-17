# 13 — Source Intelligence / Application Knowledge Graph

## Purpose
An NEXUS 'brain' does not mean copying business databases. It means an **evidence-backed digital model of each application's source and operations**: code structure, routes, modules, entities, dependencies, tests, change history, live service topology, health and approved support capabilities.

## Source analysis pipeline (proposed)
1. **Repository discovery:** get authorized repo list; record immutable SHA, default branch, language/framework and file tree. Use GitHub App with installation-specific rights; never global user's credentials.
2. **Static extraction:** parse code/migrations/config in an isolated worker. No code execution during untrusted repository indexing.
3. **Normalize graph:** create nodes with type, name, location (file:line), app/env, SHA, extractor version, confidence and evidence hash.
4. **Link relations:** e.g. ROUTE -> CONTROLLER -> SERVICE -> MODEL -> TABLE -> MIGRATION; JOB -> EVENT; ROLE -> PERMISSION -> ENDPOINT; TEST -> CODE_SYMBOL; DEPLOYMENT -> COMMIT -> CHANGE -> INCIDENT; SERVICE -> DATABASE -> STORAGE.
5. **Diff / drift:** compare last-known-good SHA to HEAD and source design vs deployed version; report added/removed routes, changing permissions, missing migration tests, deprecated APIs.
6. **Corroborate runtime:** compare static graph to sanctioned diagnostics/telemetry. An AST hypothesis is not proof of actual runtime behavior.
7. **Publication:** redact secrets/PII; version/index graph; promote new knowledge only after validation; retain provenance and time.

## Language-specific extractors
| Stack | Extractors | Limits |
|---|---|---|
| Laravel / PHP | composer, route registration, controller/actions, Eloquent models, migrations, policies, guards, artisan commands, schedule definitions, tests | dynamic route macros/DI may require safe staging introspection |
| Node / NestJS | tsconfig, decorators/routes, services, guards, Prisma/ORM schema, queues, migrations, tests | reflective decorators and runtime registrations are partial |
| Next.js | app/page/api routes, middleware, auth/session, server actions, client dependencies, env-name usage | static analysis cannot prove runtime authorization |
| Python | AST/LibCST FastAPI/Flask routers, ORM/migrations, workers, tests | runtime route generation not always statically visible |
| DB/infra | SQL DDL, schema migrations, GitHub Actions, Docker/Railway manifests, provider snapshot | provider config/secret values never copied |

## Knowledge graph node / edge types
Nodes: APPLICATION, REPO, COMMIT, MODULE, ROUTE, HANDLER, SERVICE, MODEL, TABLE, COLUMN_META, MIGRATION, ROLE, PERMISSION, CONFIG_KEY_NAME, QUEUE, JOB, EXTERNAL_INTEGRATION, PROVIDER_SERVICE, DATABASE_SERVICE, STORAGE_VOLUME, ENVIRONMENT, DEPLOYMENT, TEST, ALERT, INCIDENT, RUNBOOK, CAPABILITY, CHECK_RESULT.

Edges: DEFINES, CALLS, USES, AUTHORIZES, WRITES_TO, READS_FROM, MIGRATES, DEPENDS_ON, PRODUCES, CONSUMES, TESTED_BY, DEPLOYED_AS, RUNS_IN, CAUSED_SUSPECTED_BY, VERIFIED_BY, FIXED_IN, SUPERSEDES.

Each edge carries source_ref, commit_sha, extractor, observed_at, confidence; distinguish EXTRACTED / INFERRED / OPERATOR_VERIFIED.

## Model implementation (target)
- PostgreSQL is enough first: graph_nodes(id, app_id, source_sha, kind, symbol, file_path, line_start, line_end, evidence_hash, classification), graph_edges(id, from_id, to_id, kind, evidence_ref, confidence), graph_snapshots(app_id, sha, extracted_at, parser_version).
- App/env scoped indexes; unique fingerprints to avoid duplicates; recursive CTE for impact analysis.
- Use dedicated vector search only for documentation retrieval later; structured graph queries remain SQL/typed API.
- Store only symbols/schema metadata, not production values or raw personal data.
- GitHub API rate-limit and content permissions respected; repository content encrypted at rest if indexing requires cached files. Don't retain raw full source unnecessarily.

## Questions answered with evidence
- 'ماذا يتغير إذا عدّلنا الفاتورة؟' -> show handlers/services/tables/tests connected to invoice paths and last deployments.
- 'كيف يمشي طلب توصيل AMANZINE؟' -> show source flow, vendor API boundary, retries/idempotency and corresponding tests.
- 'هل صلاحية seller تمنح manager؟' -> show actual permission gates, API policies and potential missing tests.
- 'لماذا فشل restore؟' -> show backup version/config name, CI history, provider version and restore-drill evidence.
- 'ما الذي ينقص قبل الإنتاج؟' -> combine release gates, missing verified tests, incomplete backups and security posture.

## Per-application technical passport
The onboarding result is versioned: app identity, repo HEAD/deployed SHA, routes, modules, schema tables/relations, roles/permissions, third-party APIs, env variable **names + availability only**, queues/crons, storage, tests, broken tests, threats, backups and restore exercise, existing runbooks, SLA and open risks.

## Scoring and limitations
Each discovered relation has confidence (static AST, runtime observation or verified test). NEXUS must show **UNKNOWN** if code is inaccessible or the deployed commit differs from analyzed source. No AI hallucinated routes, SQL tables, file names or root causes are recorded as fact.
