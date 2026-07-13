import { z } from "zod";

export const problemListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string()),
});

export const listProblemsResponseSchema = z.object({
  data: z.array(problemListItemSchema),
  meta: z.object({
    total: z.string(),
    limit: z.string(),
    offset: z.string(),
  }),
});

export type ListProblemsResponse = z.infer<typeof listProblemsResponseSchema>;

export const problemDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string()),
  description: z.string(),
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string().optional(),
    })
  ),
  constraints: z.array(z.string()),
});

export const getProblemResponseSchema = z.object({
  data: problemDetailSchema,
});

export type GetProblemResponse = z.infer<typeof getProblemResponseSchema>;
