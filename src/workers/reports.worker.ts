import 'dotenv/config';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '@/shared/infra/env/index.js';
import { REPORTS_QUEUE_NAME } from '@/shared/infra/queue/bullmqJobQueue.js';
import { jobEnvelopeSchema } from '@/shared/infra/queue/jobEnvelope.schema.js';
import { dispatchReportJob } from '@/modules/reports/queue/dispatchReportJob.js';
import { inMemoryJobQueue } from '@/shared/infra/queue/inMemoryJobQueue.js';
import { processNextReportJob } from '@/modules/reports/queue/dispatchReportJob.js';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 1000);

async function startMemoryWorker(): Promise<void> {
  console.log(`[reports-worker] memory driver (poll every ${POLL_INTERVAL_MS}ms)`);

  setInterval(() => {
    void processNextReportJob(inMemoryJobQueue).catch((error: unknown) => {
      console.error('[reports-worker] job failed', error);
    });
  }, POLL_INTERVAL_MS);
}

async function startBullMQWorker(): Promise<void> {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker(
    REPORTS_QUEUE_NAME,
    async (job) => {
      const envelope = jobEnvelopeSchema.parse(job.data);
      await dispatchReportJob(envelope);
    },
    { connection },
  );

  worker.on('completed', (job) => {
    console.log(`[reports-worker] completed job ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[reports-worker] failed job ${job?.id}`, error);
  });

  console.log(`[reports-worker] bullmq driver connected to ${env.REDIS_URL}`);
}

if (env.QUEUE_DRIVER === 'bullmq') {
  void startBullMQWorker();
} else {
  void startMemoryWorker();
}

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.on(signal, () => {
    console.log(`[reports-worker] received ${signal}, shutting down`);
    process.exit(0);
  });
}
