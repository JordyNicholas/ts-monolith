import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { BullMQJobQueue, closeBullMQConnections, getReportsQueue } from './bullmqJobQueue.js';

const runRedisTests = process.env.REDIS_TESTS === 'true';
const tenantId = '00000000-0000-4000-8000-000000000001';

describe.runIf(runRedisTests)('BullMQ job queue (integration)', () => {
  beforeEach(async () => {
    await getReportsQueue().drain(true);
  });

  afterAll(async () => {
    await closeBullMQConnections();
  });

  test('enqueues a tenant-scoped report job with retry defaults', async () => {
    const producer = new BullMQJobQueue();
    await producer.enqueue({
      tenantId,
      jobName: 'process-report',
      payload: { reportId: 'report-123' },
    });

    const jobs = await getReportsQueue().getJobs(['waiting', 'delayed']);
    const job = jobs.find((candidate) => candidate.name === 'process-report');

    expect(job?.data).toMatchObject({
      tenantId,
      payload: { reportId: 'report-123' },
    });
    expect(job?.opts.attempts).toBe(3);
    expect(job?.opts.backoff).toEqual({ type: 'exponential', delay: 1000 });
  });
});
