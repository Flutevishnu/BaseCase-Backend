import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  getProblemParamsSchema,
  listProblemsQuerySchema,
  type GetProblemParams,
  type ListProblemsQuery,
} from "../schemas/request/problems.js";
import {
  getProblemResponseSchema,
  listProblemsResponseSchema,
} from "../schemas/response/problems.js";
import * as problemsService from "../services/problems.service.js";
import { sessionsRouter } from "./sessions.js";

export const problemsRouter = Router();

problemsRouter.use("/:problemId/sessions", sessionsRouter);

problemsRouter.get(
  "/",
  validate({ query: listProblemsQuerySchema }),
  async (req, res, next) => {
    try {
      const result = await problemsService.listProblems(
        req.validated.query as ListProblemsQuery,
      );
      res.json(listProblemsResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  },
);

problemsRouter.get(
  "/:problemId",
  validate({ params: getProblemParamsSchema }),
  async (req, res, next) => {
    try {
      const { problemId } = req.validated.params as GetProblemParams;
      const result = await problemsService.getProblemById(problemId);

      if (!result) {
        res.status(404).json({ error: "Problem not found" });
        return;
      }

      res.json(getProblemResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  },
);
