import { z } from "zod";

export const createUserSchema = z.object({
  clerkUserId: z.string().trim().min(1).max(255),
  name: z.string().trim().min(1).max(255),
  email: z.email().max(255),
});

export const UserUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  email: z.email().optional()
})

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof UserUpdateSchema>;

export const getUserParamsSchema = z.object({
  clerkUserId: z.string().trim().min(1).max(255),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;
