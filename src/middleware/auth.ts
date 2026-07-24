import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      clerkUserId?: string;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const clerkUserId = req.header("x-user-id");
  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = clerkUserId;
  next();
};
