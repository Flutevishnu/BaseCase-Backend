import express, { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  createSessionBodySchema,
  createSessionParamsSchema,
  type CreateSessionBody,
  type CreateSessionParams,
} from "../schemas/request/sessions.js";
import { createSessionResponseSchema } from "../schemas/response/sessions.js";
import * as sessionsService from "../services/sessions.service.js";
import * as userService from "../services/user.service.js";
import { requireAuth } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { sessionsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { sessionSubmissionsRouter } from "./submissions.js";

export const sessionsRouter = Router({ mergeParams: true });

sessionsRouter.use("/:sessionId/submissions", sessionSubmissionsRouter);

sessionsRouter.use(requireAuth);

sessionsRouter.post(
  "/",
  express.json(),
  validate({
    params: createSessionParamsSchema,
    body: createSessionBodySchema,
  }),
  async (req, res, next) => {
    try {
      const { problemId } = req.validated.params as CreateSessionParams;
      const { restart } = req.validated.body as CreateSessionBody;
      const clerkUserId = req.clerkUserId!;

      const userId = await userService.findUserIdByClerkId(clerkUserId);

      if (!userId) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const result = await sessionsService.createOrResumeSession({
        userId,
        problemId,
        restart,
      });

      res.json(createSessionResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  },
);

sessionsRouter.patch("/:sessionId/status", express.json(), async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (status !== "failed" && status !== "completed" && status !== "FAILED") {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    await db
      .update(sessionsTable)
      .set({ 
        status: status.toLowerCase() as any, 
        updatedAt: new Date(),
        ...(status.toLowerCase() === "completed" ? { completedAt: new Date() } : {})
      })
      .where(eq(sessionsTable.threadId, sessionId));

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});
