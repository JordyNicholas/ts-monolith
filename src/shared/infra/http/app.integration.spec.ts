import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '@/shared/infra/http/app.js';

describe('HTTP app (integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('GET /health returns ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  test('GET /metrics returns counters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.service).toBe('ts-monolith');
    expect(typeof body.totalRequests).toBe('number');
  });

  test('GET /users/me without token returns 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/me',
    });

    expect(response.statusCode).toBe(401);
  });
});
