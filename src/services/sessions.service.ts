import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessionsTable } from "../db/schema.js";
import type { CreateSessionResponse } from "../schemas/response/sessions.js";

interface CreateOrResumeSessionInput {
  userId: string;
  problemId: number;
  restart: boolean;
}

export async function createOrResumeSession({
  userId,
  problemId,
  restart,
}: CreateOrResumeSessionInput): Promise<CreateSessionResponse> {
  if (!restart) {
    const [existing] = await db
      .select({ threadId: sessionsTable.threadId })
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.userId, userId),
          eq(sessionsTable.problemId, problemId),
          eq(sessionsTable.status, "active"),
        ),
      )
      .limit(1);

    if (existing) {
      return { data: { threadId: existing.threadId } };
    }
  } else {
    await db
      .update(sessionsTable)
      .set({ status: "archived", updatedAt: new Date() })
      .where(
        and(
          eq(sessionsTable.userId, userId),
          eq(sessionsTable.problemId, problemId),
          eq(sessionsTable.status, "active"),
        ),
      );
  }

  const threadId = randomUUID();

  const [created] = await db
    .insert(sessionsTable)
    .values({ userId, problemId, threadId, status: "active" })
    .returning({ threadId: sessionsTable.threadId });

  return { data: { threadId: created!.threadId } };
}
