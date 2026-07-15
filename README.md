# TS Monolith Architecture

This repository implements a **strictly typed Modular Monolith architecture**. This document serves as the standard operating procedure for understanding the codebase, extending the application, and maintaining strict architectural boundaries.

---

# 1. The Architecture We Are Obeying

This structure strictly follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

The core rule is **Dependency Inversion**:

> Business logic (services) must never depend on infrastructure (database, HTTP framework, or external libraries).

By enforcing these boundaries, the codebase guarantees that changing the database engine or replacing a library (such as `bcrypt`) requires **zero changes** to the core business logic.

Additionally, if a specific domain (for example, `auth`) experiences high traffic in the future, the entire module can be extracted into an isolated microservice or AWS Lambda with minimal refactoring.

---

# 2. Directory Taxonomy

The codebase is divided into two primary directories:

```
src/
├── modules/
└── shared/
```

- `modules/` contains business domains.
- `shared/` contains infrastructure and reusable components.

---

## `modules/`

Modules represent **bounded business contexts** (e.g. `auth`, `users`).

Modules communicate through interfaces and **never couple directly** to another module's database layer.

Each module follows the same internal structure:

```text
module/
├── http/
│   ├── dtos/
│   └── *.routes.ts
├── services/
├── repositories/
└── factories/
```

### `http/` (Edge Layer)

Contains framework-specific delivery mechanisms.

#### `*.routes.ts`

Defines API endpoints and routes incoming requests.

#### `dtos/`

Contains **Zod schemas** that validate and guarantee exhaustively typed payloads.

---

### `services/` (Application Layer)

Contains the application's use cases.

Services:

- contain pure business logic;
- depend only on interfaces;
- never import `req`, `res`, Fastify, Prisma, or other infrastructure concerns.

---

### `repositories/` (Data Access Layer)

Responsible for persistence.

Contains:

- repository contracts (`*.interface.ts`);
- concrete ORM implementations (`prisma-*.repository.ts`).

---

### `factories/` (Dependency Wiring)

Implements the **Local-first** design pattern.

Factories:

- instantiate concrete repositories;
- inject dependencies into services;
- keep HTTP controllers completely decoupled from the data layer.

---

## `shared/`

Contains infrastructure, reusable utilities, and wrappers shared across all modules.

```text
shared/
├── core/
├── providers/
└── infra/
```

### `core/`

Contains domain primitives.

Examples:

- `AppError`
- custom business exceptions

This eliminates repetitive `try/catch` boilerplate throughout the application.

---

### `providers/`

Contains wrappers around external dependencies.

Examples:

- Cryptography
- JWT/Tokens
- Storage
- Email providers

Modules depend only on the provider interfaces, making the application resilient to third-party library changes.

---

### `infra/`

Contains global infrastructure.

#### `database/`

- Prisma schema
- Generated TypeScript client
- Singleton database connection

#### `http/`

Contains `app.ts`, responsible for:

- configuring Fastify;
- registering plugins;
- mounting module routes.

#### `handlers/`

Contains global interceptors and exception handlers that translate domain errors into HTTP responses.

---

# 3. Adding a New Feature (Module)

Every feature should encapsulate its entire lifecycle inside its own module.

## Step 1 — Scaffold the module

Create the directory structure:

```bash
mkdir -p src/modules/new-feature/{http/dtos,services,repositories,factories}
```

Result:

```text
new-feature/
├── http/
│   └── dtos/
├── services/
├── repositories/
└── factories/
```

---

## Step 2 — Implementation Rules

### HTTP Layer

Responsible for:

- route definitions;
- request validation using Zod;
- forwarding validated payloads to the Factory.

---

### Services Layer

Contains only business logic.

A service must depend only on interfaces such as:

```ts
INewFeatureRepository
```

A service must **never** import:

- Prisma
- Fastify
- Express
- database clients

---

### Repositories Layer

Implement:

- the repository contract:

```text
new-feature.interface.ts
```

- the concrete Prisma implementation:

```text
prisma-new-feature.repository.ts
```

---

### Factories Layer

Creates the dependency graph.

A factory:

- instantiates the repository;
- injects it into the service;
- returns a ready-to-use service instance to the HTTP controller.

---

## Step 3 — Register the module

Mount the routes inside:

```text
src/shared/infra/http/app.ts
```

Example:

```ts
app.register(newFeatureRoutes, {
  prefix: "/new-feature",
});
```

---

# 4. Managing Shared Dependencies

The `src/shared/` directory is the **only** place where global infrastructure should live.

---

## Adding Third-Party Logic (Providers)

If a feature requires an external dependency (for example Stripe, AWS S3, or Nodemailer):

**Do not import the library directly into your service.**

Instead:

1. Create a new provider directory.

```text
src/shared/providers/storage/
```

2. Define the contract.

```text
StorageProvider.interface.ts
```

3. Create the concrete implementation.

```text
S3StorageProvider.ts
```

Your module should depend only on:

```text
StorageProvider.interface.ts
```

This keeps business logic isolated from implementation details.

---

## Adding Domain Errors

Business rules should never throw generic `Error`.

Instead:

Create a new class inside:

```text
src/shared/core/errors/
```

Example:

```ts
export class InsufficientFundsError extends AppError {}
```

Throw this error inside the service.

The global error handler automatically converts it into the appropriate HTTP response.

---

# 5. Updating the Database (Prisma)

Because the database layer is completely encapsulated inside `shared`, database updates follow a strict workflow.

## Step 1 — Modify the schema

Edit:

```text
src/shared/infra/database/prisma/schema.prisma
```

---

## Step 2 — Regenerate the Prisma client

Run:

```bash
npx prisma generate
```

This regenerates the localized TypeScript client so the NodeNext compiler recognizes the updated types.

---

## Step 3 — Create and apply the migration

Run:

```bash
npx prisma migrate dev --name describe_your_change
```

Commit the generated SQL migration files.

---

# Cross-Module Data Access

If **Module A** needs data owned by **Module B**:

❌ **Do not query Module B's database tables directly.**

Instead:

- expose a method through Module B's repository interface; or
- expose an internal service responsible for retrieving the data.

Module A should communicate only through those abstractions.

This ensures that changes to Module B's database schema do not break Module A.

---

# Architecture Principles

- ✅ Domain-Driven Design (DDD)
- ✅ Clean Architecture
- ✅ Dependency Inversion
- ✅ Modular Monolith
- ✅ Strict Type Safety
- ✅ Interface-driven development
- ✅ Infrastructure isolated from business logic
- ✅ Local-first dependency wiring
- ✅ Easily extractable modules for future microservices
