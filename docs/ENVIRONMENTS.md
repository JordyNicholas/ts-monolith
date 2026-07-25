# Environment configuration

Keep environment-specific values outside source control. `.env.example`
documents local defaults; deployment platforms should inject staging and
production values.

## Local Compose vs app URL (single source of truth)

Local Postgres is bootstrapped by Compose from `POSTGRES_*`. Prisma and the
API connect with `DATABASE_URL`. Those must describe the **same** role,
password, database and port — otherwise you get Prisma `P1000` authentication
errors.

| Concern             | Variable(s)                                                               | Who reads it                             |
| ------------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| Container bootstrap | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST_PORT` | `docker compose` / Postgres image        |
| App + Prisma        | `DATABASE_URL`                                                            | Node, `prisma migrate`, `prisma db seed` |

Example local pair:

```env
POSTGRES_HOST_PORT=5432
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=monolith_db
DATABASE_URL=postgresql://user:password@localhost:5432/monolith_db
```

Checks:

```bash
npm run db:check-env
```

`npm run setup`, `db:migrate`, `db:migrate:deploy` and `db:seed` run this check
first when Compose bootstrap vars are present.

Postgres applies `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` only on
**first volume init**. After changing them locally:

```bash
docker compose down -v
docker compose up -d
```

Never use `down -v` against a database that holds real data.

## Environment matrix

| Variable                  | Local                     | Test                          | Production                         |
| ------------------------- | ------------------------- | ----------------------------- | ---------------------------------- |
| `NODE_ENV`                | `development`             | `test`                        | `production`                       |
| `POSTGRES_*`              | required for Compose      | unused (CI service env)       | unused (managed DB)                |
| `DATABASE_URL`            | local Compose             | isolated test DB              | managed secret (TLS required)      |
| `JWT_SECRET`              | generated developer value | deterministic test-only value | unique managed secret              |
| `JWT_REFRESH_SECRET`      | optional derived value    | deterministic test-only value | independent managed secret         |
| `DEFAULT_TENANT_ID`       | seeded demo tenant        | deterministic fixture         | avoid as product routing           |
| `QUEUE_DRIVER`            | `memory`                  | `memory`                      | `bullmq` when workers are required |
| `TOKEN_REVOCATION_DRIVER` | `memory`                  | `memory`                      | `redis` for multiple API instances |
| `REDIS_URL`               | local Redis when needed   | integration-test Redis        | managed secret                     |
| `CORS_ORIGIN`             | local frontend origin     | test origin                   | explicit deployed origins          |
| `OTEL_ENABLED`            | normally `false`          | `false`                       | product decision                   |
| `OTEL_SERVICE_NAME`       | local service name        | test service name             | product/environment name           |

## Production secret layout

Prefer a managed Postgres (RDS, Cloud SQL, Neon, etc.). Do not run the Compose
`postgres` service as production.

Inject at runtime (platform secrets / vault), never commit:

| Secret                  | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `DATABASE_URL_MIGRATOR` | CI/CD migrate job only; role may run DDL              |
| `DATABASE_URL`          | API + worker runtime; DML on app tables, no broad DDL |
| `JWT_SECRET`            | Access tokens                                         |
| `JWT_REFRESH_SECRET`    | Refresh tokens (independent value)                    |
| `REDIS_URL`             | BullMQ / revocation when enabled                      |

Production `DATABASE_URL` must:

- use unique credentials (not local `user` / `password` @ `localhost`);
- enable TLS (`?sslmode=require` or `?ssl=true`).

The app refuses to boot in `NODE_ENV=production` if those rules fail.

## Build-time versus runtime

All backend variables are runtime inputs. The same build artifact should be
promotable through environments without recompilation.

`TOKEN_REVOCATION_DRIVER` is independent from background job processing. If it
is omitted, it follows `QUEUE_DRIVER` (`bullmq` selects Redis) for backward
compatibility.

## Secrets

- Never commit `.env`.
- Do not share secrets between preview, staging and production.
- Prefer platform secret references over values embedded in Compose or CI YAML.
- Plan rotation before launch. Access and refresh secrets should be independently
  rotatable.

## Database lifecycle

- Local development: `npm run db:migrate` (`prisma migrate dev`).
- CI and deployed environments: `npm run db:migrate:deploy` (or
  `npx prisma migrate deploy` in the release job).
- Run migrations **once** per release (see
  [examples/migrate.github-actions.yml](examples/migrate.github-actions.yml)),
  not from every API replica on boot.
- Production seeding must be explicit and idempotent. The demo seed is not a
  production tenant-provisioning mechanism.

## Preview environments

Give each preview an isolated database/schema or a strict cleanup policy. Do
not point untrusted pull-request builds at shared production-like data.
