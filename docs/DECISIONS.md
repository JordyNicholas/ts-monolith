# Architecture Decision Log

Short ADRs for boilerplate consumers. When you fork this repo, update these as your product evolves.

---

## ADR-001: Modular Monolith over Microservices (initial)

**Decision:** Start as a modular monolith with bounded contexts (`users`, `auth`, `reports`).

**Why:** Faster iteration, simpler ops, clear module boundaries that can be extracted later.

**Trade-off:** Requires discipline (dependency-cruiser rules) to avoid a big ball of mud.

---

## ADR-002: Fastify + Zod at the HTTP edge

**Decision:** Fastify with `fastify-type-provider-zod` for request/response validation.

**Why:** High performance, first-class TypeScript, schema-driven OpenAPI generation.

**Trade-off:** Less ecosystem familiarity than Express for some teams.

---

## ADR-003: Prisma + PostgreSQL

**Decision:** Prisma 7 with PostgreSQL and the `@prisma/adapter-pg` driver.

**Why:** Type-safe queries, migrations in-repo, compound tenant keys in schema.

**Trade-off:** Domain entities are mapped from Prisma in repositories — not pure ORM-free DDD.

---

## ADR-004: Factory-based dependency wiring

**Decision:** Each module exposes `make*Service` factories instead of a global DI container.

**Why:** Explicit, local, easy to read; no magic; good for boilerplates and small teams.

**Trade-off:** More boilerplate than NestJS-style injection.

---

## ADR-005: Multi-tenancy via header + Prisma extension

**Decision:** Resolve tenant from `x-tenant-id` (fallback: seeded default). Scope queries with `getTenantPrisma(tenantId)`.

**Why:** Simple for APIs and workers; tenant ID in JWT for protected routes.

**Trade-off:** Not subdomain-based tenancy; header must be trusted only on public routes.

---

## ADR-006: Queue driver abstraction (`memory` vs `bullmq`)

**Decision:**

| Driver                | Use case                                      |
| --------------------- | --------------------------------------------- |
| `QUEUE_DRIVER=memory` | Local dev, unit tests, single-process demos   |
| `QUEUE_DRIVER=bullmq` | Production / multi-process workers with Redis |

**Why:** Boilerplate works without Redis locally; production path is one env var away.

**Trade-off:** In-memory queue is not durable and not shared across processes.

---

## ADR-007: Argon2 default, bcrypt optional

**Decision:** `HASH_ALGORITHM=argon2` by default; `bcrypt` still available.

**Why:** Argon2id is the modern password-hashing recommendation (OWASP).

**Trade-off:** Existing bcrypt hashes need re-hash on login if you switch algorithms.

---

## ADR-008: JWT access + refresh with revocation store

**Decision:** Short-lived access tokens (15m) + refresh tokens (7d). Logout revokes JTIs via in-memory or Redis store.

**Why:** Stateless API with a practical logout story for boilerplate consumers.

**Trade-off:** Not a full session server; rotation/revocation requires Redis in multi-instance prod.

---

## ADR-009: Architecture boundaries enforced by dependency-cruiser

**Decision:** `npm run lint:architecture` blocks cross-module imports and service→HTTP DTO coupling.

**Why:** README rules are not enough — automate enforcement.

**Trade-off:** `typescript-eslint` is deferred until TS 7 support lands in the ecosystem.

---

## ADR-010: Observability stubs

**Decision:** `/metrics` in-process counters + optional OpenTelemetry span helper (`OTEL_ENABLED=true`).

**Why:** Shows where to plug Prometheus/OTel without forcing a vendor.

**Trade-off:** Not production-grade observability out of the box.

---

## ADR-011: E2E tests behind `E2E_TESTS=true`

**Decision:** Full HTTP happy-path test runs only when `E2E_TESTS=true` (enabled in CI after migrations).

**Why:** Local dev without Postgres still runs unit/integration tests; CI proves real wiring.

**Trade-off:** Developers must set the flag locally to run e2e manually.
