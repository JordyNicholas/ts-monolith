import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../env/index.js';
import { JobEnvelope } from './jobEnvelope.schema.js';
import { IJobQueueProducer } from './jobQueue.interface.js';

export const REPORTS_QUEUE_NAME = 'reports';

let connection: Redis | undefined;
let reportsQueue: Queue | undefined;

function getConnection(): Redis {
  if (!connection) {
    connection = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

export function getReportsQueue(): Queue {
  if (!reportsQueue) {
    reportsQueue = new Queue(REPORTS_QUEUE_NAME, {
      connection: getConnection(),
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    });
  }
  return reportsQueue;
}

export class BullMQJobQueue implements IJobQueueProducer {
  public async enqueue(job: JobEnvelope): Promise<void> {
    const queue = getReportsQueue();
    await queue.add(job.jobName, job, {
      jobId: `${job.tenantId}:${job.jobName}:${String(job.payload.reportId ?? Date.now())}`,
    });
  }
}

export async function closeBullMQConnections(): Promise<void> {
  await reportsQueue?.close();
  await connection?.quit();
  reportsQueue = undefined;
  connection = undefined;
}
