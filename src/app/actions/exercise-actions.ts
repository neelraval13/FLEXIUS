// src/app/actions/exercise-actions.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { auth } from "@/lib/auth";

interface ExerciseInput {
  name: string;
  targetMuscle: string;
  muscleGroup: string;
  equipmentUsed: string[];
  difficulty: string;
  alternatives: string[];
  videoUrl: string | null;
}

export async function createExercise(input: ExerciseInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db
    .insert(exercises)
    .values({
      name: input.name,
      targetMuscle: input.targetMuscle,
      muscleGroup: input.muscleGroup,
      equipmentUsed: JSON.stringify(input.equipmentUsed),
      difficulty: input.difficulty,
      alternatives: JSON.stringify(input.alternatives),
      videoUrl: input.videoUrl,
    })
    .returning();

  revalidatePath("/exercises");
  revalidatePath("/settings");
  return result[0];
}

export async function updateExercise(
  id: number,
  input: Partial<ExerciseInput>,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

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
    .where(eq(exercises.id, id))
    .returning();

  revalidatePath("/exercises");
  revalidatePath(`/exercises/${id}`);
  revalidatePath("/settings");
  return result[0] ?? null;
}

export async function deleteExercise(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(exercises).where(eq(exercises.id, id));

  revalidatePath("/exercises");
  revalidatePath("/settings");
}
