import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { usersTable } from "../db/schema.js";
import type { CreateUserInput, UpdateUserInput } from "../schemas/request/user.js";
import type {
  CreateUserResponse,
  UserIdResponse,
  UpdateUserResponse
} from "../schemas/response/user.js";

export async function createUser(
  input: CreateUserInput,
): Promise<CreateUserResponse> {
  const inserted = await db
    .insert(usersTable)
    .values(input)
    .onConflictDoNothing()
    .returning({ id: usersTable.id });

  return { success: inserted.length > 0 };
}

export async function updateUser(
  clerkUserId: string,
  input: UpdateUserInput
): Promise<UpdateUserResponse> {
  const updated = await db
    .update(usersTable)
    .set(input)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .returning({ id: usersTable.id });

  return { success: updated.length > 0 };
}

export async function findUserIdByClerkId(
  clerkUserId: string,
): Promise<string | null> {
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);

  return user?.id ?? null;
}

export async function getUserIdByClerkId(
  clerkUserId: string,
): Promise<UserIdResponse | null> {
  const id = await findUserIdByClerkId(clerkUserId);

  if (!id) {
    return null;
  }

  return { data: { id } };
}
