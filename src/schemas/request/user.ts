import { z } from "zod";

export const createUserSchema = z.object({
  clerkUserId: z.string().trim().min(1).max(255),
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const getUserParamsSchema = z.object({
  clerkUserId: z.string().trim().min(1).max(255),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;
