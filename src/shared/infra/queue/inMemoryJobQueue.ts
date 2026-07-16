import { JobEnvelope } from './jobEnvelope.schema.js';
import { IJobQueue } from './jobQueue.interface.js';

/**
 * In-memory queue for local development and boilerplate demos.
 * Swap this implementation for BullMQ/SQS in production without changing consumers.
 */
export class InMemoryJobQueue implements IJobQueue {
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
