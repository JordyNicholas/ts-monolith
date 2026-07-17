# Testing strategy

## Commands

```bash
npm test
npm run test:e2e
npm run typecheck
npm run lint
npm run openapi:check
```

## Layers

- **Service tests:** fast domain/application behavior using in-memory adapters.
- **HTTP integration tests:** Fastify routing, validation and authentication
  without requiring a live network listener.
- **Database E2E:** registration through reports against PostgreSQL.
- **Redis integration:** BullMQ enqueue behavior and retry defaults.
- **Architecture checks:** dependency-cruiser enforces module boundaries.
- **Contract checks:** generated OpenAPI must match committed route schemas.

Database and Redis tests are conditional locally and enabled by CI. Use isolated
services and deterministic tenant IDs.

## Tenant isolation

Every tenant-owned repository must test:

- reads cannot return another tenant's entity;
- writes cannot override the active tenant;
- uniqueness rules are tenant-scoped where intended;
- background jobs preserve tenant identity.

The module scaffolder generates a starter cross-tenant service test.

## Adding a feature

Prefer this order:

1. service test with an in-memory repository;
2. implementation;
3. Prisma repository and isolation test;
4. HTTP integration test;
5. update the DB E2E flow only for critical journeys;
6. export and review OpenAPI.
