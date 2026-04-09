// src/app/actions/cardio-stretching-actions.ts
"use server";

import { eq, and } from "drizzle-orm";
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

const getAuthenticatedUserId = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
};

const verifyOwnership = async (id: number, userId: string) => {
  const [row] = await db
    .select({ id: cardioStretching.id, userId: cardioStretching.userId })
    .from(cardioStretching)
    .where(eq(cardioStretching.id, id))
    .limit(1);

  if (!row) throw new Error("Entry not found");
  if (row.userId === null) throw new Error("Cannot modify shared base entries");
  if (row.userId !== userId)
    throw new Error("You can only modify your own entries");

  return row;
};

export async function createCardioStretching(input: CardioStretchingInput) {
  const userId = await getAuthenticatedUserId();

  const result = await db
    .insert(cardioStretching)
    .values({
      userId,
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
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

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
    .where(
      and(eq(cardioStretching.id, id), eq(cardioStretching.userId, userId)),
    )
    .returning();

  revalidatePath("/exercises");
  revalidatePath("/settings");
  return result[0] ?? null;
}

export async function deleteCardioStretching(id: number) {
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

  await db
    .delete(cardioStretching)
    .where(
      and(eq(cardioStretching.id, id), eq(cardioStretching.userId, userId)),
    );

  revalidatePath("/exercises");
  revalidatePath("/settings");
}
