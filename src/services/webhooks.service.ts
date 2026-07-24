import { eq, sql, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessionsTable, userConceptMasteryTable, usersTable } from "../db/schema.js";
import type { LanggraphWebhookBody } from "../schemas/request/webhooks.js";
import { getLatestPendingSubmission, updateSubmissionStatus } from "./submissions.service.js";

export async function processSessionSummary(payload: LanggraphWebhookBody) {
  const [session] = await db.select({ id: sessionsTable.id, userId: sessionsTable.userId })
    .from(sessionsTable)
    .where(eq(sessionsTable.threadId, payload.thread_id));

  if (!session) {
    throw new Error(`Session not found for thread ${payload.thread_id}`);
  }

  const userId = session.userId;
  const summary = payload.values?.session_summary;
  const review = payload.values?.review;

  // 1. Update the latest pending submission and complete session
  if (review) {
    const latestSubmission = await getLatestPendingSubmission(session.id);
    
    if (latestSubmission) {
      await updateSubmissionStatus(latestSubmission.id, "completed", review);
    }

    await db.update(sessionsTable)
      .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(sessionsTable.id, session.id));
  } else if (payload.values?.current_phase === "CODING") {
    // If the phase is CODING and there's no review, it means the code was rejected by the AI
    const latestSubmission = await getLatestPendingSubmission(session.id);
    if (latestSubmission) {
      await updateSubmissionStatus(latestSubmission.id, "rejected");
    }
  }

  if (!summary) return;

  // 1. Update Technical Blindspots and Behavioral Traits
  if (summary.technical_blindspots.length > 0 || summary.behavioral_traits.length > 0) {
    const [user] = await db.select({
      technicalBlindspots: usersTable.technicalBlindspots,
      behavioralTraits: usersTable.behavioralTraits,
    }).from(usersTable).where(eq(usersTable.id, userId));

    if (user) {
      const newBlindspots = Array.from(new Set([...(user.technicalBlindspots || []), ...summary.technical_blindspots]));
      const newTraits = Array.from(new Set([...(user.behavioralTraits || []), ...summary.behavioral_traits]));

      await db.update(usersTable)
        .set({
          technicalBlindspots: newBlindspots,
          behavioralTraits: newTraits,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId));
    }
  }

  // 2. Upsert Concept Mastery
  if (summary.concept_updates && summary.concept_updates.length > 0) {
    const dateStr = new Date().toISOString();

    for (const concept of summary.concept_updates) {
      const historyEntry = {
        problemName: summary.problem_name,
        approach: concept.approach_used,
        date: dateStr,
      };

      await db.insert(userConceptMasteryTable)
        .values({
          userId,
          concept: concept.tag,
          status: concept.status,
          generalContext: concept.general_context,
          problemHistory: [historyEntry],
        })
        .onConflictDoUpdate({
          target: [userConceptMasteryTable.userId, userConceptMasteryTable.concept],
          set: {
            status: concept.status,
            generalContext: concept.general_context,
            problemHistory: sql`${userConceptMasteryTable.problemHistory} || ${JSON.stringify([historyEntry])}::jsonb`,
            updatedAt: new Date()
          }
        });
    }
  }
}
