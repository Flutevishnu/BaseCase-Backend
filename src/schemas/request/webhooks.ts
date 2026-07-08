import { z } from "zod";

export const tagUpdateSchema = z.object({
  tag: z.string(),
  status: z.enum(["mastered", "struggling", "needs_review"]),
  general_context: z.string(),
  approach_used: z.string(),
});

export const sessionSummarySchema = z.object({
  problem_name: z.string(),
  technical_blindspots: z.array(z.string()),
  behavioral_traits: z.array(z.string()),
  concept_updates: z.array(tagUpdateSchema),
});

export type SessionSummary = z.infer<typeof sessionSummarySchema>;

export const langgraphWebhookSchema = z.object({
  run_id: z.string(),
  thread_id: z.string().uuid(),
  status: z.string(),
  values: z.object({
    session_summary: sessionSummarySchema.optional(),
  }).passthrough().optional(),
}).passthrough();

export type LanggraphWebhookBody = z.infer<typeof langgraphWebhookSchema>;
