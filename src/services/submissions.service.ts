import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessionsTable, submissionsTable } from "../db/schema.js";
import { logger } from "../lib/logger.js";

export async function createSubmission(
  sessionIdFromUrl: string,
  userId: string,
  code: string
): Promise<{ id: string } | null> {
  logger.info({ sessionIdFromUrl, userId }, "Creating a new submission");
  
  const [session] = await db
    .select({ id: sessionsTable.id })
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.threadId, sessionIdFromUrl),
        eq(sessionsTable.userId, userId)
      )
    )
    .limit(1);

  if (!session) {
    logger.warn({ sessionIdFromUrl, userId }, "Session not found for submission creation");
    return null;
  }

  const [submission] = await db
    .insert(submissionsTable)
    .values({
      sessionId: session.id,
      code,
      status: "pending",
    })
    .returning({ id: submissionsTable.id });

  logger.info({ submissionId: submission!.id, sessionId: session.id }, "Successfully created submission");
  
  return { id: submission!.id };
}

export async function getLatestPendingSubmission(sessionId: string): Promise<{ id: string } | null> {
  const [submission] = await db
    .select({ id: submissionsTable.id })
    .from(submissionsTable)
    .where(and(eq(submissionsTable.sessionId, sessionId), eq(submissionsTable.status, "pending")))
    .orderBy(desc(submissionsTable.createdAt))
    .limit(1);
    
  return submission || null;
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: "failed" | "completed" | "rejected",
  review?: any
): Promise<boolean> {
  logger.info({ submissionId, status }, "Updating submission status");

  const updated = await db
    .update(submissionsTable)
    .set({ status, ...(review ? { review } : {}), updatedAt: new Date() })
    .where(eq(submissionsTable.id, submissionId))
    .returning({ id: submissionsTable.id });

  if (updated.length > 0) {
    logger.info({ submissionId, status }, "Successfully updated submission status");
  } else {
    logger.warn({ submissionId, status }, "Submission not found for status update");
  }

  return updated.length > 0;
}
