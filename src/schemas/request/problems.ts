import { z } from "zod";

function emptyToUndefined(val: unknown) {
  return val === "" || val === null || val === undefined ? undefined : val;
}

export const listProblemsQuerySchema = z.object({
  tag: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).optional(),
  ),
  difficulty: z.preprocess(
    emptyToUndefined,
    z.enum(["Easy", "Medium", "Hard"]).optional(),
  ),
  offset: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().nonnegative().default(0),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().max(100).default(20),
  ),
});

export type ListProblemsQuery = z.infer<typeof listProblemsQuerySchema>;

export const getProblemParamsSchema = z.object({
  problemId: z.coerce.number().int().positive(),
});

export type GetProblemParams = z.infer<typeof getProblemParamsSchema>;
