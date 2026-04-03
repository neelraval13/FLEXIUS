import { eq, like } from "drizzle-orm";
import { db } from "@/db";
import { cardioStretching } from "@/db/schema";

export async function getAllCardioStretching() {
  return db.select().from(cardioStretching).all();
}

export async function getCardioStretchingById(id: number) {
  const rows = await db
    .select()
    .from(cardioStretching)
    .where(eq(cardioStretching.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCardioStretchingByCategory(category: string) {
  return db
    .select()
    .from(cardioStretching)
    .where(eq(cardioStretching.category, category))
    .all();
}

export async function getCardioStretchingByTargetMuscle(targetMuscle: string) {
  return db
    .select()
    .from(cardioStretching)
    .where(eq(cardioStretching.targetMuscle, targetMuscle))
    .all();
}

export async function searchCardioStretching(query: string) {
  return db
    .select()
    .from(cardioStretching)
    .where(like(cardioStretching.name, `%${query}%`))
    .all();
}
