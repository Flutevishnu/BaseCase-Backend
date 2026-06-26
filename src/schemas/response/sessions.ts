import { z } from "zod";

export const createSessionResponseSchema = z.object({
  data: z.object({
    threadId: z.string(),
  }),
});

export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;
