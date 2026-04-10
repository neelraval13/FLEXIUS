// src/app/actions/muscle-group-actions.ts
"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { muscleGroups } from "@/db/schema";
import { auth } from "@/lib/auth";
import { invalidatePromptCache } from "@/lib/build-system-prompt";

interface MuscleGroupInput {
  majorGroup: string;
  targetMuscle: string;
}

const getAuthenticatedUserId = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
};

const verifyOwnership = async (id: number, userId: string) => {
  const [row] = await db
    .select({ id: muscleGroups.id, userId: muscleGroups.userId })
    .from(muscleGroups)
    .where(eq(muscleGroups.id, id))
    .limit(1);

  if (!row) throw new Error("Muscle group not found");
  if (row.userId === null)
    throw new Error("Cannot modify shared base muscle groups");
  if (row.userId !== userId)
    throw new Error("You can only modify your own muscle groups");

  return row;
};

export async function createMuscleGroup(input: MuscleGroupInput) {
  const userId = await getAuthenticatedUserId();

  const result = await db
    .insert(muscleGroups)
    .values({
      userId,
      majorGroup: input.majorGroup,
      targetMuscle: input.targetMuscle,
    })
    .returning();

  invalidatePromptCache(userId);
  revalidatePath("/settings");
  revalidatePath("/exercises");
  return result[0];
}

export async function updateMuscleGroup(
  id: number,
  input: Partial<MuscleGroupInput>,
) {
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

  const values: Record<string, unknown> = {};

  if (input.majorGroup !== undefined) values.majorGroup = input.majorGroup;
  if (input.targetMuscle !== undefined)
    values.targetMuscle = input.targetMuscle;

  const result = await db
    .update(muscleGroups)
    .set(values)
    .where(and(eq(muscleGroups.id, id), eq(muscleGroups.userId, userId)))
    .returning();

  invalidatePromptCache(userId);
  revalidatePath("/settings");
  revalidatePath("/exercises");
  return result[0] ?? null;
}

export async function deleteMuscleGroup(id: number) {
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

  await db
    .delete(muscleGroups)
    .where(and(eq(muscleGroups.id, id), eq(muscleGroups.userId, userId)));

  invalidatePromptCache(userId);
  revalidatePath("/settings");
  revalidatePath("/exercises");
}
