import { z } from "zod";

export const createSubmissionBodySchema = z.object({
  code: z.string(),
});

export const updateSubmissionStatusBodySchema = z.object({
  status: z.enum(["failed", "completed", "rejected"]),
});

export type CreateSubmissionBody = z.infer<typeof createSubmissionBodySchema>;
export type UpdateSubmissionStatusBody = z.infer<typeof updateSubmissionStatusBodySchema>;
