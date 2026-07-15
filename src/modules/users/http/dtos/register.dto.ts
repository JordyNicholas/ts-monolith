import { z } from 'zod';

export const registerBodySchema = z.object({
  email: z.email(),
  name: z.string().min(5),
  password: z.string().min(8),
});
