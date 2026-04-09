import { eq, like, or, isNull, and } from "drizzle-orm";
import { db } from "@/db";
import { equipment } from "@/db/schema";

/** Return shared (seed) equipment + this user's private equipment */
export async function getAllEquipment(userId: string) {
  return db
    .select()
    .from(equipment)
    .where(or(isNull(equipment.userId), eq(equipment.userId, userId)))
    .all();
}

export async function getEquipmentById(id: number) {
  const rows = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function searchEquipment(query: string, userId?: string) {
  const conditions = userId
    ? and(
        like(equipment.name, `%${query}%`),
        or(isNull(equipment.userId), eq(equipment.userId, userId)),
      )
    : like(equipment.name, `%${query}%`);

  return db.select().from(equipment).where(conditions).all();
}
