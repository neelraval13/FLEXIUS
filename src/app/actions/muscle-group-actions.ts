// src/app/actions/muscle-group-actions.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { muscleGroups } from "@/db/schema";
import { auth } from "@/lib/auth";

interface MuscleGroupInput {
  majorGroup: string;
  targetMuscle: string;
}

export async function createMuscleGroup(input: MuscleGroupInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db
    .insert(muscleGroups)
    .values({
      majorGroup: input.majorGroup,
      targetMuscle: input.targetMuscle,
    })
    .returning();

  revalidatePath("/settings");
  revalidatePath("/exercises");
  return result[0];
}

export async function updateMuscleGroup(
  id: number,
  input: Partial<MuscleGroupInput>,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const values: Record<string, unknown> = {};

  if (input.majorGroup !== undefined) values.majorGroup = input.majorGroup;
  if (input.targetMuscle !== undefined)
    values.targetMuscle = input.targetMuscle;

  const result = await db
    .update(muscleGroups)
    .set(values)
    .where(eq(muscleGroups.id, id))
    .returning();

  revalidatePath("/settings");
  revalidatePath("/exercises");
  return result[0] ?? null;
}

export async function deleteMuscleGroup(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(muscleGroups).where(eq(muscleGroups.id, id));

  revalidatePath("/settings");
  revalidatePath("/exercises");
}
