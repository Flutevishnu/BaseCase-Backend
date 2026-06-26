import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

type RequestPart = "body" | "query" | "params";

type ValidationSchemas = Partial<Record<RequestPart, ZodTypeAny>>;

declare global {
  namespace Express {
    interface Request {
      validated: Partial<Record<RequestPart, unknown>>;
    }
  }
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    req.validated ??= {};

    for (const [part, schema] of Object.entries(schemas) as [
      RequestPart,
      ZodTypeAny,
    ][]) {
      const result = schema.safeParse(req[part]);

      if (!result.success) {
        res.status(400).json({
          error: "Validation failed",
          details: formatZodError(result.error),
        });
        return;
      }

      req.validated[part] = result.data;
    }

    next();
  };
}

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
