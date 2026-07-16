import { env } from '../env/index.js';
import { BullMQJobQueue } from './bullmqJobQueue.js';
import { inMemoryJobQueue } from './inMemoryJobQueue.js';
import { IJobQueueProducer } from './jobQueue.interface.js';

export function getJobQueue(): IJobQueueProducer {
  if (env.QUEUE_DRIVER === 'bullmq') {
    return new BullMQJobQueue();
  }
  return inMemoryJobQueue;
}
