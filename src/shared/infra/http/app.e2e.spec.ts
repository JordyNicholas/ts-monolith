import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { buildApp } from '@/shared/infra/http/app.js';
import { DEFAULT_TENANT_ID } from '@/shared/infra/env/constants.js';
import { prisma } from '@/shared/infra/database/prisma.js';

const runE2E = process.env.E2E_TESTS === 'true';

describe.runIf(runE2E)('E2E happy path', () => {
  let app: FastifyInstance;
  const email = `e2e-${randomUUID()}@example.com`;
  const password = 'E2ePassword123!';
  let accessToken = '';

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    await prisma.tenant.upsert({
      where: { id: DEFAULT_TENANT_ID },
      update: {},
      create: { id: DEFAULT_TENANT_ID, name: 'Default Tenant' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  test('register → login → profile → create report → list reports', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/users/',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': DEFAULT_TENANT_ID,
      },
      payload: {
        name: 'E2E User',
        email,
        password,
      },
    });
    expect(register.statusCode).toBe(201);

    const login = await app.inject({
      method: 'POST',
      url: '/auth/login',
      headers: {
        'content-type': 'application/json',
        'x-tenant-id': DEFAULT_TENANT_ID,
      },
      payload: { email, password },
    });
    expect(login.statusCode).toBe(200);
    const loginBody = login.json() as { accessToken: string; refreshToken: string };
    accessToken = loginBody.accessToken;
    expect(accessToken).toBeTruthy();
    expect(loginBody.refreshToken).toBeTruthy();

    const profile = await app.inject({
      method: 'GET',
      url: '/users/me',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(profile.statusCode).toBe(200);
    const profileBody = profile.json() as { email: string; tenantId: string };
    expect(profileBody.email).toBe(email);
    expect(profileBody.tenantId).toBe(DEFAULT_TENANT_ID);

    const createReport = await app.inject({
      method: 'POST',
      url: '/reports/',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      payload: { title: 'E2E Monthly Report' },
    });
    expect(createReport.statusCode).toBe(201);
    const reportBody = createReport.json() as { id: string; title: string };
    expect(reportBody.title).toBe('E2E Monthly Report');

    const listReports = await app.inject({
      method: 'GET',
      url: '/reports/?page=1&limit=10',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(listReports.statusCode).toBe(200);
    const listBody = listReports.json() as {
      data: Array<{ id: string }>;
      meta: { total: number };
    };
    expect(listBody.data.some((item) => item.id === reportBody.id)).toBe(true);
    expect(listBody.meta.total).toBeGreaterThanOrEqual(1);
  });
});
