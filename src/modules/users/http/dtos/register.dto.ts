import { z } from 'zod';

export const registerBodySchema = z.object({
  email: z.email("Invalid email format"),
  name: z.string().min(5, "Name must be at least 5 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const createUserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string()
})
