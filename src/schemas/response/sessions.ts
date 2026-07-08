import { z } from "zod";

export const createSessionResponseSchema = z.object({
  data: z.object({
    threadId: z.string(),
    isNew: z.boolean(),
    problemTags: z.array(z.string()).optional(),
    userMemory: z.object({
      technicalBlindspots: z.array(z.string()),
      behavioralTraits: z.array(z.string()),
      pastRelatedProblems: z.array(z.string()),
    }).optional(),
  }),
});

export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;
