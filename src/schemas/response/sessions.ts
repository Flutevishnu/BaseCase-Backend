import { z } from "zod";

export const createSessionResponseSchema = z.object({
  data: z.object({
    threadId: z.string(),
    isNew: z.boolean(),
  }),
});

export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;
