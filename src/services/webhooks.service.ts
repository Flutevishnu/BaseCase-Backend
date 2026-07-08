import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessionsTable, userConceptMasteryTable, usersTable } from "../db/schema.js";
import type { LanggraphWebhookBody } from "../schemas/request/webhooks.js";

export async function processSessionSummary(payload: LanggraphWebhookBody) {
  const [session] = await db.select({ userId: sessionsTable.userId })
    .from(sessionsTable)
    .where(eq(sessionsTable.threadId, payload.thread_id));

  if (!session) {
    throw new Error(`Session not found for thread ${payload.thread_id}`);
  }

  const userId = session.userId;
  const summary = payload.values?.session_summary;

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
