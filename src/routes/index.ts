import { Router } from "express";
import { problemsRouter } from "./problems.js";
import { userRouter } from "./user.js";
import { submissionsRouter } from "./submissions.js";

import { sessionsRouter } from "./sessions.js";

export const v1Router = Router();

v1Router.use("/problems", problemsRouter);
v1Router.use("/user", userRouter);
v1Router.use("/submissions", submissionsRouter);
v1Router.use("/sessions", sessionsRouter);
