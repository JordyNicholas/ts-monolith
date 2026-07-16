import { JobEnvelope } from './jobEnvelope.schema.js';
import { IJobQueueProducer } from './jobQueue.interface.js';

/**
 * In-memory queue for local development when QUEUE_DRIVER=memory.
 * Jobs are process-local — use BullMQ (QUEUE_DRIVER=bullmq) for multi-process workers.
 */
export class InMemoryJobQueue implements IJobQueueProducer {
  private readonly jobs: JobEnvelope[] = [];

  public async enqueue(job: JobEnvelope): Promise<void> {
    this.jobs.push(job);
  }

  public async dequeue(): Promise<JobEnvelope | null> {
    return this.jobs.shift() ?? null;
  }

  public size(): number {
    return this.jobs.length;
  }
}

export const inMemoryJobQueue = new InMemoryJobQueue();
