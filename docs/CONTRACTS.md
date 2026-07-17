# API contract workflow

Fastify route schemas are the source of truth. The generated OpenAPI document is
committed so downstream clients can review and version API changes.

## Backend change

1. Update route request/response schemas.
2. Update implementation and tests.
3. Export the contract:

   ```bash
   npm run openapi:export
   ```

4. Review `openapi/openapi.json` as part of the code change.
5. Run:

   ```bash
   npm run openapi:check
   ```

CI publishes the validated contract as an artifact for downstream consumers.

## Paired frontend update

From the frontend repository, sync either the local sibling file or the
published/raw contract, then regenerate types:

```bash
npm run api:sync
npm run api:generate
npm run api:check
```

See the frontend `docs/CONTRACTS.md` for source selection.

## Compatibility policy

Before a product launch, choose and document an API compatibility policy.
Recommended defaults:

- adding optional fields/endpoints is compatible;
- removing or renaming fields/endpoints is breaking;
- changing validation to reject previously valid requests is breaking;
- changing response status codes is breaking.

Breaking changes should use a coordinated frontend release or an explicitly
versioned endpoint. Do not rely on generated TypeScript alone to detect runtime
compatibility.
