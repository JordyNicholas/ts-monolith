-- Drop global uniqueness so email/name can repeat across tenants.
-- Tenant-scoped uniqueness on (email, tenantId) already exists.

DROP INDEX IF EXISTS "users_email_key";
DROP INDEX IF EXISTS "users_name_key";
