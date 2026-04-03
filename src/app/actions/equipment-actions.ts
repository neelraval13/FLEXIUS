// src/app/actions/equipment-actions.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { auth } from "@/lib/auth";

interface EquipmentInput {
  name: string;
}

export async function createEquipment(input: EquipmentInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db
    .insert(equipment)
    .values({ name: input.name })
    .returning();

  revalidatePath("/settings");
  return result[0];
}

export async function updateEquipment(id: number, input: EquipmentInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db
    .update(equipment)
    .set({ name: input.name })
    .where(eq(equipment.id, id))
    .returning();

  revalidatePath("/settings");
  return result[0] ?? null;
}

export async function deleteEquipment(id: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(equipment).where(eq(equipment.id, id));

  revalidatePath("/settings");
}
