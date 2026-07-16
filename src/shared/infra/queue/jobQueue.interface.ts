import { JobEnvelope } from './jobEnvelope.schema.js';

export interface IJobQueueProducer {
  enqueue(job: JobEnvelope): Promise<void>;
}
