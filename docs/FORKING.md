# Forking this boilerplate

Use this checklist before implementing product features. Commit the rename and
configuration work separately so later changes remain easy to review.

## 1. Establish product identity

Replace these boilerplate values:

| Concern           | Current value               | Main locations                           |
| ----------------- | --------------------------- | ---------------------------------------- |
| npm package       | `ts-monolith`               | `package.json`, `package-lock.json`      |
| API title         | `TS Monolith API`           | `src/shared/infra/http/app.ts`           |
| telemetry service | `ts-monolith`               | `.env.example`, env configuration        |
| Docker resources  | `ts_monolith_*`, `monolith` | `docker-compose.yml`                     |
| database          | `monolith_db`               | Compose, env files, CI, test config      |
| default tenant    | fixed demo UUID             | env constants, examples, tests, frontend |
| repository links  | JordyNicholas repositories  | documentation                            |

Search before finishing:

```bash
git grep -n -i "ts.monolith\|monolith_db\|00000000-0000-4000-8000-000000000001"
```

## 2. Decide what to keep

The `reports` module demonstrates persistence, pagination and background work.
Choose one:

- keep and rename it as the first product domain;
- retain it in a learning/demo branch;
- remove it after copying its patterns into the first real module.

If removing it, update route registration, queue consumers, Prisma models,
migrations, OpenAPI output, tests and the paired frontend.

## 3. Define real tenancy

The boilerplate accepts an `x-tenant-id` header on public routes and falls back
to a seeded tenant. Before production, document and implement:

- how a user discovers or joins an organization;
- whether tenant identity comes from a subdomain, slug, invitation or identity
  provider claim;
- membership and role models;
- tenant-switching rules;
- isolation tests for every tenant-owned model.

Do not expose a free-form tenant UUID field in a product UI.

## 4. Choose authentication ownership

Decide whether authentication is:

- owned by this API;
- delegated to an identity provider;
- mediated by the paired Next.js BFF.

If this API owns credentials, add the product-required flows (email
verification, reset, lockout and audit events). Read [Security](SECURITY.md).

## 5. Create environment configuration

- Copy `.env.example` without committing `.env`.
- Generate unique secrets for every environment.
- Replace wildcard CORS with the actual frontend origins.
- Decide whether Redis and a separate worker are required.
- Configure telemetry names and exporters.

See [Environments](ENVIRONMENTS.md).

## 6. Validate the fork

```bash
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run openapi:check
npm run build
```

Finally, update the paired frontend contract and run its complete validation.
