import 'dotenv/config';
import { inMemoryJobQueue } from '@/shared/infra/queue/inMemoryJobQueue.js';
import { processNextReportJob } from '@/modules/reports/queue/dispatchReportJob.js';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 1000);

async function tick(): Promise<void> {
  try {
    const processed = await processNextReportJob(inMemoryJobQueue);
    if (processed) {
      console.log('[reports-worker] processed 1 job');
    }
  } catch (error: unknown) {
    console.error('[reports-worker] job failed', error);
  }
}

console.log(`[reports-worker] started (poll every ${POLL_INTERVAL_MS}ms)`);
console.log(
  '[reports-worker] note: in-memory queue is process-local — run API and worker in the same process for demos, or swap for Redis/BullMQ.',
);

setInterval(() => {
  void tick();
}, POLL_INTERVAL_MS);

const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.on(signal, () => {
    console.log(`[reports-worker] received ${signal}, shutting down`);
    process.exit(0);
  });
}
