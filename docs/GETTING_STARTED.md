# Getting started

This guide is the shortest path from a fresh clone to a working API. The root
README remains the architecture reference.

## Prerequisites

- Node.js 22
- npm
- Docker Desktop or another Docker Compose implementation

## Local development

Automated setup (creates `.env` with unique local secrets, starts PostgreSQL,
generates Prisma, migrates and seeds):

```bash
npm install
npm run setup
npm run dev
```

Equivalent manual setup:

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

PowerShell:

```powershell
npm install
Copy-Item .env.example .env
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Replace the example `JWT_SECRET` before starting the API. PostgreSQL must use
the `monolith_db` database configured by Compose.

## Verify the installation

```bash
curl http://localhost:3333/health
curl http://localhost:3333/ready
npm test
npm run test:e2e
```

Expected results:

- `/health` returns `{"status":"ok"}`.
- `/ready` returns `{"status":"ready"}`.
- Unit and HTTP tests pass.
- The E2E test completes register, login, profile and reports operations.

## Choose a local queue mode

`QUEUE_DRIVER=memory` is the default and processes jobs inside the API. It is
the simplest option while developing domain logic.

Use BullMQ only when testing worker behavior:

```bash
docker compose up -d postgres redis
```

Then set `QUEUE_DRIVER=bullmq` and run the API and worker in separate terminals:

```bash
npm run dev
npm run dev:worker
```

## Before building a product

Read these documents in order:

1. [Forking](FORKING.md)
2. [Security model](SECURITY.md)
3. [Environments](ENVIRONMENTS.md)
4. [API contracts](CONTRACTS.md)
5. [Operations](OPERATIONS.md)
6. [Creating modules](MODULES.md)

The seeded tenant and editable `x-tenant-id` flow are development conveniences,
not a complete production tenancy model.
