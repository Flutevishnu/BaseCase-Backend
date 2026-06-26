import { and, count, eq, sql, type SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { problemsTable } from "../db/schema.js";
import type { ListProblemsQuery } from "../schemas/request/problems.js";
import type {
  GetProblemResponse,
  ListProblemsResponse,
} from "../schemas/response/problems.js";

function buildFilters(query: ListProblemsQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.difficulty) {
    conditions.push(eq(problemsTable.difficulty, query.difficulty));
  }

  if (query.tag) {
    conditions.push(sql`${query.tag} = ANY(${problemsTable.tags})`);
  }

  return and(...conditions);
}

export async function listProblems(
  query: ListProblemsQuery,
): Promise<ListProblemsResponse> {
  const where = buildFilters(query);

  const [problems, countResult] = await Promise.all([
    db
      .select({
        id: problemsTable.id,
        title: problemsTable.title,
        difficulty: problemsTable.difficulty,
        tags: problemsTable.tags,
      })
      .from(problemsTable)
      .where(where)
      .limit(query.limit)
      .offset(query.offset),
    db.select({ total: count() }).from(problemsTable).where(where),
  ]);

  const total = countResult[0]?.total ?? 0;

  return {
    data: problems.map((problem) => ({
      id: String(problem.id),
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags.join(","),
    })),
    meta: {
      total: String(total),
      limit: String(query.limit),
      offset: String(query.offset),
    },
  };
}

export async function getProblemById(
  id: number,
): Promise<GetProblemResponse | null> {
  const [problem] = await db
    .select({
      id: problemsTable.id,
      title: problemsTable.title,
      difficulty: problemsTable.difficulty,
      tags: problemsTable.tags,
      description: problemsTable.description,
      examples: problemsTable.examples,
      constraints: problemsTable.constraints,
    })
    .from(problemsTable)
    .where(eq(problemsTable.id, id))
    .limit(1);

  if (!problem) {
    return null;
  }

  return {
    data: {
      id: String(problem.id),
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      description: problem.description,
      examples: problem.examples,
      constraints: problem.constraints,
    },
  };
}
