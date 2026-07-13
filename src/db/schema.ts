import { integer, pgTable, timestamp, varchar, text, uuid, jsonb, uniqueIndex, unique } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  clerkUserId: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  technicalBlindspots: jsonb("technical_blindspots").$type<string[]>().default([]),
  behavioralTraits: jsonb("behavioral_traits").$type<string[]>().default([]),
});


export const problemsTable = pgTable("problems", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  difficulty: text({ enum: ["Easy", "Medium", "Hard"] }).notNull(),
  tags: text().array().notNull(),
  examples: jsonb().$type<{ input: string, output: string, explanation?: string }>().notNull().array().notNull(),
  constraints: text().array().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
})

export const sessionsTable = pgTable("sessions", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => usersTable.id).notNull(),
  problemId: integer().references(() => problemsTable.id).notNull(),
  threadId: uuid().notNull(),
  code: text(),
  status: text({ enum: ["active", "completed", "archived"] }).notNull().default("active"),
  startedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const userConceptMasteryTable = pgTable("user_concept_mastery", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id).notNull(),
  concept: varchar("concept", { length: 255 }).notNull(),

  status: text("status", { enum: ["mastered", "struggling", "needs_review"] }).notNull(),
  generalContext: text("general_context").notNull(),

  problemHistory: jsonb("problem_history").$type<{
    problemName: string;
    approach: string;
    date: string;
  }[]>().default([]),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.userId, t.concept),
}));
