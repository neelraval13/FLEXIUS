// src/app/actions/exercise-actions.ts
"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { auth } from "@/lib/auth";
import { invalidatePromptCache } from "@/lib/build-system-prompt";

interface ExerciseInput {
  name: string;
  targetMuscle: string;
  muscleGroup: string;
  equipmentUsed: string[];
  difficulty: string;
  alternatives: string[];
  videoUrl: string | null;
}

const getAuthenticatedUserId = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
};

/** Verify the row is user-owned (not seed data) and belongs to current user */
const verifyOwnership = async (id: number, userId: string) => {
  const [row] = await db
    .select({ id: exercises.id, userId: exercises.userId })
    .from(exercises)
    .where(eq(exercises.id, id))
    .limit(1);

  if (!row) throw new Error("Exercise not found");
  if (row.userId === null)
    throw new Error("Cannot modify shared base exercises");
  if (row.userId !== userId)
    throw new Error("You can only modify your own exercises");

  return row;
};

export async function createExercise(input: ExerciseInput) {
  const userId = await getAuthenticatedUserId();

  const result = await db
    .insert(exercises)
    .values({
      userId,
      name: input.name,
      targetMuscle: input.targetMuscle,
      muscleGroup: input.muscleGroup,
      equipmentUsed: JSON.stringify(input.equipmentUsed),
      difficulty: input.difficulty,
      alternatives: JSON.stringify(input.alternatives),
      videoUrl: input.videoUrl,
    })
    .returning();

  invalidatePromptCache(userId);
  revalidatePath("/exercises");
  revalidatePath("/settings");
  return result[0];
}

export async function updateExercise(
  id: number,
  input: Partial<ExerciseInput>,
) {
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

  const values: Record<string, unknown> = {};

  if (input.name !== undefined) values.name = input.name;
  if (input.targetMuscle !== undefined)
    values.targetMuscle = input.targetMuscle;
  if (input.muscleGroup !== undefined) values.muscleGroup = input.muscleGroup;
  if (input.difficulty !== undefined) values.difficulty = input.difficulty;
  if (input.videoUrl !== undefined) values.videoUrl = input.videoUrl;
  if (input.equipmentUsed !== undefined)
    values.equipmentUsed = JSON.stringify(input.equipmentUsed);
  if (input.alternatives !== undefined)
    values.alternatives = JSON.stringify(input.alternatives);

  const result = await db
    .update(exercises)
    .set(values)
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId)))
    .returning();

  invalidatePromptCache(userId);
  revalidatePath("/exercises");
  revalidatePath(`/exercises/${id}`);
  revalidatePath("/settings");
  return result[0] ?? null;
}

export async function deleteExercise(id: number) {
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

  await db
    .delete(exercises)
    .where(and(eq(exercises.id, id), eq(exercises.userId, userId)));

  invalidatePromptCache(userId);
  revalidatePath("/exercises");
  revalidatePath("/settings");
}
