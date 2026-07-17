# Operations guide

This is a baseline runbook for a fork. Replace examples with platform-specific
commands and ownership before production.

## Full Docker stack

`docker compose --profile full` builds the API and worker with
`NODE_ENV=production`. Production env validation rejects demo JWT secrets and
wildcard CORS.

Before starting:

```bash
# Ensure .env contains unique values, for example after npm run setup
docker compose --profile full up -d --build
```

Compose fails fast if `JWT_SECRET` or `JWT_REFRESH_SECRET` are missing. The
worker process also requires those secrets because it loads the shared env
module.

## Deployment order

1. Back up the database when required by the migration risk.
2. Run `npm run db:generate` during build.
3. Run `npx prisma migrate deploy` as a single deployment job.
4. Deploy API instances.
5. Deploy workers using the same application version.
6. Verify `/health`, `/ready`, representative API calls and queue processing.

Avoid running migrations concurrently from every API replica.

## Health signals

- `/health`: process is running.
- `/ready`: PostgreSQL is reachable.
- `/metrics`: starter process-local counters.

Redis and worker readiness are not currently represented by `/ready`; add
platform probes when BullMQ becomes required.

## Queues

Before relying on BullMQ in production, define:

- idempotency keys for jobs;
- which failures are retryable;
- maximum attempts and backoff;
- terminal/failed-job retention;
- replay procedure and authorization;
- alert thresholds for age, failures and worker availability.

## Observability

The included metrics and tracing modules are extension points. A production fork
should wire:

- centralized structured logs with request IDs;
- error reporting;
- Prometheus/OpenTelemetry export;
- API latency/error dashboards;
- queue depth, age and failure dashboards;
- alerts with an owning team and runbook link.

## Rollback

Application rollback is safe only when the previous version remains compatible
with the deployed schema. Prefer backward-compatible expand/migrate/contract
migrations for destructive database changes.

## Backup and recovery

Document backup frequency, retention, encryption, restore permissions, recovery
time objective and recovery point objective. Test a restore before launch.
