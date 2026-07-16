import { z } from 'zod';

export const profileResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  tenantId: z.uuid(),
});
