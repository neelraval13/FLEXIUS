// src/app/actions/cardio-stretching-actions.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cardioStretching } from "@/db/schema";
import { auth } from "@/lib/auth";

interface CardioStretchingInput {
  name: string;
  targetMuscle: string;
  category: string;
  equipmentUsed: string[];
  difficulty: string;
  alternatives: string[];
  videoUrl: string | null;
}

export async function createCardioStretching(input: CardioStretchingInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db
    .insert(cardioStretching)
    .values({
      name: input.name,
      targetMuscle: input.targetMuscle,
      category: input.category,
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

export async function updateCardioStretching(
  id: number,
  input: Partial<CardioStretchingInput>,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const values: Record<string, unknown> = {};

  if (input.name !== undefined) values.name = input.name;
  if (input.targetMuscle !== undefined)
    values.targetMuscle = input.targetMuscle;
  if (input.category !== undefined) values.category = input.category;
  if (input.difficulty !== undefined) values.difficulty = input.difficulty;
  if (input.videoUrl !== undefined) values.videoUrl = input.videoUrl;
  if (input.equipmentUsed !== undefined)
    values.equipmentUsed = JSON.stringify(input.equipmentUsed);
  if (input.alternatives !== undefined)
    values.alternatives = JSON.stringify(input.alternatives);

  const result = await db
    .update(cardioStretching)
    .set(values)
    .where(eq(cardioStretching.id, id))
    .returning();

  revalidatePath("/exercises");
  revalidatePath("/settings");
  return result[0] ?? null;
}

export async function deleteCardioStretching(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(cardioStretching).where(eq(cardioStretching.id, id));

  revalidatePath("/exercises");
  revalidatePath("/settings");
}
