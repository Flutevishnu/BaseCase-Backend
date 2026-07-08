import { Router } from "express";
import { problemsRouter } from "./problems.js";
import { userRouter } from "./user.js";
import { webhooksRouter } from "./webhooks.js";

export const v1Router = Router();

v1Router.use("/problems", problemsRouter);
v1Router.use("/user", userRouter);
v1Router.use("/webhooks", webhooksRouter);
