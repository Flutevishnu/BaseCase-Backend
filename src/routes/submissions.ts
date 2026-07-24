import express, { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import * as submissionsService from "../services/submissions.service.js";
import * as userService from "../services/user.service.js";
import { createSubmissionBodySchema, updateSubmissionStatusBodySchema } from "../schemas/request/submissions.js";
import type { CreateSubmissionBody, UpdateSubmissionStatusBody } from "../schemas/request/submissions.js";

export const sessionSubmissionsRouter = Router({ mergeParams: true });

sessionSubmissionsRouter.use(requireAuth);

sessionSubmissionsRouter.post("/", express.json(), validate({ body: createSubmissionBodySchema }), async (req, res, next) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { code } = req.validated!.body as CreateSubmissionBody;
    const clerkUserId = req.clerkUserId!;

    const userId = await userService.findUserIdByClerkId(clerkUserId);
    if (!userId) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const result = await submissionsService.createSubmission(sessionId, userId, code);
    if (!result) {
      res.status(404).json({ error: "Session not found or does not belong to user" });
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export const submissionsRouter = Router({ mergeParams: true });

submissionsRouter.patch("/:submissionId/status", express.json(), validate({ body: updateSubmissionStatusBodySchema }), async (req, res, next) => {
  try {
    const submissionId = req.params.submissionId as string;
    const { status } = req.validated!.body as UpdateSubmissionStatusBody;

    const result = await submissionsService.updateSubmissionStatus(submissionId, status);
    if (!result) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
