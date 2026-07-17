# Security model

This boilerplate supplies security building blocks, not a finished product
threat model. Review every section before deploying a fork.

## Authentication

- Passwords use Argon2 by default.
- Access and refresh tokens use separate secrets.
- Refresh tokens rotate and can be revoked.
- Authorization headers are redacted from application logs.

Production secrets must be generated independently, stored outside source
control and rotated through the deployment platform. Never use the values from
examples or Compose in a deployed environment.

The product must still define:

- email verification and password reset;
- failed-login policy and account recovery;
- authorization roles and permissions;
- security-event auditing;
- token lifetime and secret rotation procedures.

## Tenancy

The development flow resolves public requests from `x-tenant-id` or a seeded
default tenant. This is intentionally convenient for demonstrations.

In a product:

- derive tenant access from authenticated membership, invitations or a trusted
  host/identity claim;
- verify membership before every tenant-scoped operation;
- add a new tenant-owned model to the Prisma tenant allowlist;
- add cross-tenant isolation tests whenever models or repository operations
  change;
- do not treat possession of a tenant UUID as authorization.

## Browser boundary

For browser products, prefer a backend-for-frontend that stores tokens in
`httpOnly`, `Secure`, `SameSite` cookies. If cookies authenticate state-changing
requests, document and implement a CSRF defense appropriate to the deployment.

The direct bearer-token flow is useful for API clients and learning. Browser
storage of refresh tokens is not the recommended production default.

## CORS

Wildcard CORS is a local-development convenience. Production must use an
explicit comma-separated allowlist:

```env
CORS_ORIGIN=https://app.example.com,https://admin.example.com
```

Do not combine broad origin reflection with credentialed browser requests.

## Rate limiting

The included rate limiter is process-local. A horizontally scaled deployment
needs a shared store and product-specific limits, especially for login,
registration and password recovery.

## HTTP and data

- Helmet is enabled; production enables its content security policy.
- Zod validates route input.
- Internal errors are logged without returning stack traces to clients.
- Database credentials and backups are deployment responsibilities.

Review data classification, retention, deletion, encryption and backup restore
requirements for the product domain.

## Pre-deployment checklist

- [ ] Unique production JWT and refresh secrets
- [ ] Explicit production CORS allowlist
- [ ] HTTPS enforced by the platform
- [ ] Secure browser session and CSRF strategy
- [ ] Membership-based tenant authorization
- [ ] Shared rate-limit storage where needed
- [ ] Database backups and restore drill
- [ ] Dependency and container scanning
- [ ] Security-event logging and alert ownership
