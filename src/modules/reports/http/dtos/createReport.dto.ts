import { z } from 'zod';
import { paginationQuerySchema } from '@/shared/core/pagination.js';

export const createReportBodySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
});

export const createReportResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  tenantId: z.uuid(),
});

export const reportItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  tenantId: z.uuid(),
  createdAt: z.string(),
});

export const listReportsQuerySchema = paginationQuerySchema;

export const listReportsResponseSchema = z.object({
  data: z.array(reportItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
