import { z } from 'zod';

export const jobEnvelopeSchema = z.object({
  tenantId: z.uuid('Invalid tenantId in job envelope'),
  jobName: z.string(),
  payload: z.record(z.string(), z.unknown()),
  metadata: z
    .object({
      retryCount: z.number().int().nonnegative().default(0),
      timestamp: z.iso.datetime(),
    })
    .optional(),
});

export type JobEnvelope = z.infer<typeof jobEnvelopeSchema>;
