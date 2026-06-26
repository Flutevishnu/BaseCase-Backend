import { Router } from "express";
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

export const sessionsRouter = Router({ mergeParams: true });

sessionsRouter.post(
  "/",
  validate({
    params: createSessionParamsSchema,
    body: createSessionBodySchema,
  }),
  async (req, res, next) => {
    try {
      const { problemId } = req.validated.params as CreateSessionParams;
      const { clerkUserId, restart } = req.validated.body as CreateSessionBody;

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
