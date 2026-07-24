import { z } from "zod";

export const createSessionParamsSchema = z.object({
  problemId: z.coerce.number().int().positive(),
});

export type CreateSessionParams = z.infer<typeof createSessionParamsSchema>;

export const createSessionBodySchema = z.object({
  restart: z.boolean().optional().default(false),
});

export type CreateSessionBody = z.infer<typeof createSessionBodySchema>;
