import { z } from 'zod';

// 1. Define the strict base schema that every background job MUST follow
export const jobEnvelopeSchema = z.object({
  tenantId: z.string().uuid('Invalid tenantId in job envelope'),
  jobName: z.string(),
  // payload is strictly defined by the specific job handler later
  payload: z.record(z.string(), z.unknown()),
  metadata: z.object({
    retryCount: z.number().int().nonnegative().default(0),
    timestamp: z.iso.datetime()
  }).optional()
});

export type JobEnvelope = z.infer<typeof jobEnvelopeSchema>;