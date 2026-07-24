import { z } from "zod";

export const createSubmissionResponseSchema = z.object({
  id: z.uuid(),
});

export type CreateSubmissionResponse = z.infer<typeof createSubmissionResponseSchema>;
