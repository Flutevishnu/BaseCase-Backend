import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessionsTable, problemsTable, usersTable, userConceptMasteryTable } from "../db/schema.js";
import { inArray } from "drizzle-orm";
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
      return { data: { threadId: existing.threadId, isNew: false } };
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

  // 1. Get problem tags
  const [problem] = await db.select({ tags: problemsTable.tags })
    .from(problemsTable)
    .where(eq(problemsTable.id, problemId));
    
  const problemTags = problem?.tags || [];

  // 2. Get User traits
  const [userProfile] = await db.select({
    technicalBlindspots: usersTable.technicalBlindspots,
    behavioralTraits: usersTable.behavioralTraits,
  }).from(usersTable).where(eq(usersTable.id, userId));

  // 3. Get Tag Mastery History
  const pastRelatedProblems: string[] = [];
  if (problemTags.length > 0) {
    const masteries = await db.select({
      concept: userConceptMasteryTable.concept,
      problemHistory: userConceptMasteryTable.problemHistory,
    }).from(userConceptMasteryTable)
      .where(
        and(
          eq(userConceptMasteryTable.userId, userId),
          inArray(userConceptMasteryTable.concept, problemTags)
        )
      );

    for (const m of masteries) {
      if (m.problemHistory && Array.isArray(m.problemHistory)) {
        m.problemHistory.forEach((h: any) => {
          pastRelatedProblems.push(`[${m.concept}] ${h.problemName}: ${h.approach}`);
        });
      }
    }
  }

  const [created] = await db
    .insert(sessionsTable)
    .values({ userId, problemId, threadId, status: "active" })
    .returning({ threadId: sessionsTable.threadId });

  return { 
    data: { 
      threadId: created!.threadId, 
      isNew: true,
      problemTags,
      userMemory: {
        technicalBlindspots: userProfile?.technicalBlindspots || [],
        behavioralTraits: userProfile?.behavioralTraits || [],
        pastRelatedProblems,
      }
    } 
  };
}
