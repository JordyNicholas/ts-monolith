import { JobEnvelope } from './jobEnvelope.schema.js';

export interface IJobQueue {
  enqueue(job: JobEnvelope): Promise<void>;
  dequeue(): Promise<JobEnvelope | null>;
  size(): number;
}
