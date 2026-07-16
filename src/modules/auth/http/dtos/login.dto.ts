import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.uuid(),
    name: z.string(),
  }),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string(),
});

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().optional(),
});
