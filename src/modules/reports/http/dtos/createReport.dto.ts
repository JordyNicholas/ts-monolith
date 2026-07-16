import { z } from 'zod';

export const createReportBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
});

export const createReportResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  tenantId: z.uuid(),
});
