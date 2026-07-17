# Environment configuration

Keep environment-specific values outside source control. `.env.example`
documents local defaults; deployment platforms should inject staging and
production values.

## Environment matrix

| Variable                  | Local                     | Test                          | Production                         |
| ------------------------- | ------------------------- | ----------------------------- | ---------------------------------- |
| `NODE_ENV`                | `development`             | `test`                        | `production`                       |
| `DATABASE_URL`            | local Compose             | isolated test DB              | managed secret                     |
| `JWT_SECRET`              | generated developer value | deterministic test-only value | unique managed secret              |
| `JWT_REFRESH_SECRET`      | optional derived value    | deterministic test-only value | independent managed secret         |
| `DEFAULT_TENANT_ID`       | seeded demo tenant        | deterministic fixture         | avoid as product routing           |
| `QUEUE_DRIVER`            | `memory`                  | `memory`                      | `bullmq` when workers are required |
| `TOKEN_REVOCATION_DRIVER` | `memory`                  | `memory`                      | `redis` for multiple API instances |
| `REDIS_URL`               | local Redis when needed   | integration-test Redis        | managed secret                     |
| `CORS_ORIGIN`             | local frontend origin     | test origin                   | explicit deployed origins          |
| `OTEL_ENABLED`            | normally `false`          | `false`                       | product decision                   |
| `OTEL_SERVICE_NAME`       | local service name        | test service name             | product/environment name           |

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

- Local development: `prisma migrate dev`.
- CI and deployed environments: `prisma migrate deploy`.
- Production seeding must be explicit and idempotent. The demo seed is not a
  production tenant-provisioning mechanism.

## Preview environments

Give each preview an isolated database/schema or a strict cleanup policy. Do
not point untrusted pull-request builds at shared production-like data.
