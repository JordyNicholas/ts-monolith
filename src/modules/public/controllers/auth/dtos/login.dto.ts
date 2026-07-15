import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
});