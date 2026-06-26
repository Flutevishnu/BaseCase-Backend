import express from "express";
import { pinoHttp } from "pino-http";
import { healthRouter } from "./routes/health.js";
import { v1Router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./lib/logger.js";

export function createApp() {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      redact: ["req.headers.authorization", "req.headers.cookie"],
    }),
  );

  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/v1", v1Router);

  app.use(errorHandler);

  return app;
}
