import { eq, like } from "drizzle-orm";
import { db } from "@/db";
import { equipment } from "@/db/schema";

export async function getAllEquipment() {
  return db.select().from(equipment).all();
}

export async function getEquipmentById(id: number) {
  const rows = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function searchEquipment(query: string) {
  return db
    .select()
    .from(equipment)
    .where(like(equipment.name, `%${query}%`))
    .all();
}
