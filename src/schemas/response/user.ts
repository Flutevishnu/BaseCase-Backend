import { z } from "zod";

export const createUserResponseSchema = z.object({
  success: z.boolean(),
});

export const updateUserResponseSchema = z.object({
  success: z.boolean(),
});

export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;

export const userIdResponseSchema = z.object({
  data: z.object({
    id: z.string(),
  }),
});

export type UserIdResponse = z.infer<typeof userIdResponseSchema>;
