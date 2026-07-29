# Development rule book

Living standards for this boilerplate: **code smells → practices**, **code optimisation**, and **token/context hygiene** when working with AI agents in Cursor.

**Scope:** The portable rulebook is the Cursor **user rule** “Global rulebook (all projects)” — it applies in every workspace, including new empty repos. This file only adds **ts-monolith-specific** detail (Fastify, Prisma, modules, OpenAPI, architecture lint). Prefer the stricter of the two when both apply.

Use this file as the checklist for reviews, scaffolding, and long agent sessions. Architecture mechanics stay in the [README](../README.md); decisions stay in [DECISIONS.md](./DECISIONS.md).

---

## 1. Code smells → good practices

Smells collected while building and hardening this modular monolith. Prefer the practice column; architecture lint (`npm run lint:architecture`) enforces several of these.

| Code smell                                                         | Why it hurts                                              | Good practice                                                                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Service imports Prisma / Fastify / queue clients**               | Business logic couples to infra; hard to test and extract | Services depend only on interfaces; factories wire concrete implementations                             |
| **HTTP routes contain business rules**                             | Edge layer becomes a second application layer             | Routes: validate with Zod → call factory → return; no domain branching in handlers                      |
| **Cross-module table / repository access**                         | Bounded contexts collapse into a ball of mud              | Call the owning module’s interface or internal service; never reach into another module’s Prisma models |
| **Throwing generic `Error` for domain failures**                   | Global handler cannot map status/codes consistently       | Extend `AppError` (or siblings) under `shared/core/errors/`                                             |
| **Direct third-party imports in services** (bcrypt, Stripe, S3, …) | Library swaps force service edits                         | Add a provider interface + implementation under `shared/providers/`                                     |
| **Prisma / HTTP DTO types leaking into services**                  | Application layer tied to transport and ORM shapes        | Map to domain entities / service input types at repository and route boundaries                         |
| **Half-wired features** (stub queue, partial tenancy, dead config) | Docs lie; day-1 setup fails; false confidence             | Ship a working path or remove it; document driver trade-offs in ADRs                                    |
| **God service / multi-use-case class**                             | Hard to test, review, and reuse                           | One use case per service file; compose via factories when needed                                        |
| **Anemic module** (empty `domain/`, logic only in Prisma calls)    | No ubiquitous language; rules scatter                     | Keep domain types/entities meaningful; repositories map persistence ↔ domain                            |
| **Tenant-blind queries on tenant-owned data**                      | Data leaks across tenants                                 | Always use tenant-scoped Prisma access; add isolation tests for tenant-owned reads/writes               |
| **Duplicated API shapes FE ↔ BE**                                  | Drift and double maintenance                              | Single OpenAPI contract (`openapi/openapi.json`); codegen on the consumer                               |
| **`shared/` as a junk drawer**                                     | Hidden coupling, circular deps                            | Only true cross-cutting infra, providers, and core primitives live in `shared/`                         |
| **Skipping architecture / contract checks**                        | Boundaries erode silently                                 | Run `lint:architecture`, tests, and `openapi:check` before merge                                        |
| **Copy-paste module wiring**                                       | Inconsistent structure, missed layers                     | Prefer `npm run scaffold:module` then replace samples deliberately                                      |

### Quick review prompts

- Can this service run with an in-memory fake and no Fastify/Prisma imports?
- If this module were extracted tomorrow, what would break?
- Is every tenant-owned read/write explicitly scoped and tested?

---

## 2. Code optimisation

Optimise for **clarity, boundaries, and cost of change** first; micro-optimise only with evidence.

| Area                 | Do                                                             | Avoid                                                           |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| **Structure**        | Keep modules thin and extractable; local factories             | Global DI containers, premature microservices                   |
| **Data access**      | Batch/paginate list endpoints; tenant-scoped queries           | Unbounded `findMany`, N+1 loops in services                     |
| **Async work**       | `QUEUE_DRIVER=memory` locally; `bullmq` + worker in prod       | Fake “async” that still blocks the request path in prod configs |
| **Auth**             | Short-lived access tokens + refresh/revocation stores          | Long-lived bearer tokens with no revocation story               |
| **Crypto**           | Argon2 default for passwords                                   | Rolling your own hashing or leaving demo JWT secrets in prod    |
| **HTTP**             | Schema-first Zod + OpenAPI; reuse pagination helpers           | Ad-hoc validation and one-off list response shapes              |
| **Runtime**          | Structured logs with request/tenant IDs; redacted auth headers | Logging secrets or dumping full payloads in prod                |
| **Tests**            | Unit services with fakes; HTTP integration; one e2e happy path | Only testing through the full stack for every rule              |
| **Dependencies**     | Interface + one default implementation                         | Abstracting every library before a second implementation exists |
| **Frontend pairing** | Thin console; contract types from OpenAPI                      | Duplicating DTO types by hand in the Next app                   |

Performance changes should include a before/after signal (query count, latency, allocation) when they touch hot paths.

---

## 3. Token & context hygiene (Cursor)

Conversation history dominates Usage Context. Keep agent threads lean so each turn costs less and stays sharper.

### Adopted habits

1. **One task → one chat.** New feature/bug/refactor = new thread. Do not use a chat as a long-term archive.
2. **Handoff, don’t continue.** When switching tasks, start fresh with: goal, constraints, done/not-done, and `@` on 1–3 files (or a short `PLAN.md`).
3. **`/summarize` between phases.** After exploration/planning, compress before a large implementation push—don’t wait for the context limit.
4. **Don’t stuff the transcript.** Prefer paths over pasted logs/diffs; ask for targeted reads (`@symbol`, ranges) over whole large files; use `@folder` as a map.
5. **Isolate exploration.** Use Ask mode / explore subagents for wide search; bring a short finding list into the implementation chat.
6. **Plan before thrash.** Use Plan mode for multi-file work so corrective turns don’t balloon history.
7. **Persist outside chat.** Write decisions/checklists to `docs/` or a short plan file; resume via `@` instead of replaying tool residue.
8. **Stop and restart when stuck.** A tighter new prompt beats 10 corrective messages in a bloated thread.

### What _not_ to put in always-on project rules

Long always-apply project rules increase the fixed Rules bucket on every turn. Keep `.cursor/rules/` short and repo-specific. Portable guidance belongs in the **user rule** (global); deep monolith detail belongs here and in the README.

### Agent-facing defaults for this repo

- Prefer `run`/`read` of specific paths over dumping trees into the chat.
- After non-trivial work, leave a **short** handoff (files touched + next step)—not a full session replay.
- Do not re-attach large generated artifacts (`openapi` dumps, lockfiles, build logs) unless the task is about those files.

---

## 4. Definition of done (agent or human)

A change is ready when:

- [ ] Layering respected (no new smell from the table above)
- [ ] `npm run lint` / architecture boundaries clean for touched modules
- [ ] Relevant unit/HTTP tests updated; tenant isolation covered if tenancy touched
- [ ] OpenAPI exported/checked if HTTP contract changed
- [ ] ADR or this rule book updated if a new recurring smell/practice appeared
- [ ] Chat handoff (if any) is short enough to paste into a new thread
