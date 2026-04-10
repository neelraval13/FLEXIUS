// src/app/actions/equipment-actions.ts
"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { invalidatePromptCache } from "@/lib/build-system-prompt";

interface EquipmentInput {
  name: string;
}

const getAuthenticatedUserId = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
};

const verifyOwnership = async (id: number, userId: string) => {
  const [row] = await db
    .select({ id: equipment.id, userId: equipment.userId })
    .from(equipment)
    .where(eq(equipment.id, id))
    .limit(1);

  if (!row) throw new Error("Equipment not found");
  if (row.userId === null)
    throw new Error("Cannot modify shared base equipment");
  if (row.userId !== userId)
    throw new Error("You can only modify your own equipment");

  return row;
};

export async function createEquipment(input: EquipmentInput) {
  const userId = await getAuthenticatedUserId();

  const result = await db
    .insert(equipment)
    .values({ userId, name: input.name })
    .returning();

  invalidatePromptCache(userId);
  revalidatePath("/settings");
  return result[0];
}

export async function updateEquipment(id: number, input: EquipmentInput) {
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

  const result = await db
    .update(equipment)
    .set({ name: input.name })
    .where(and(eq(equipment.id, id), eq(equipment.userId, userId)))
    .returning();

  invalidatePromptCache(userId);
  revalidatePath("/settings");
  return result[0] ?? null;
}

export async function deleteEquipment(id: number) {
  const userId = await getAuthenticatedUserId();
  await verifyOwnership(id, userId);

  await db
    .delete(equipment)
    .where(and(eq(equipment.id, id), eq(equipment.userId, userId)));

  invalidatePromptCache(userId);
  revalidatePath("/settings");
}
