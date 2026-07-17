# Creating a module

Generate the initial bounded-context structure:

```bash
npm run scaffold:module -- billing
```

The scaffold intentionally starts with in-memory behavior so domain design can
be tested before persistence is added. It does not silently modify the Prisma
schema.

## Generated structure

- domain entity
- repository contract
- in-memory repository
- application service
- factory placeholder
- HTTP DTO and route
- starter service test

## Required next steps

1. Replace the sample entity fields with domain language.
2. Complete and run the generated service test.
3. Add a Prisma model and migration when persistence is required.
4. Add the model to tenant enforcement if it is tenant-owned.
5. Implement a Prisma repository and wire the factory.
6. Register the generated route in `src/shared/infra/http/app.ts`.
7. Add HTTP integration tests.
8. Export and review the OpenAPI contract.
9. Sync the paired frontend types.

## Architectural rules

- Domain/application code must not import Fastify, Prisma or queue clients.
- Repository interfaces belong to the module.
- Infrastructure implementations satisfy module-owned interfaces.
- Tenant-owned reads and writes need explicit isolation tests.
- Route schemas define the external contract.

Run `npm run lint:architecture` after adding dependencies.
