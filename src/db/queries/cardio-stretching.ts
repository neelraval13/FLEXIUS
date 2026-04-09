import { eq, like, or, isNull, and } from "drizzle-orm";
import { db } from "@/db";
import { cardioStretching } from "@/db/schema";

/** Return shared (seed) entries + this user's private entries */
export async function getAllCardioStretching(userId: string) {
  return db
    .select()
    .from(cardioStretching)
    .where(
      or(isNull(cardioStretching.userId), eq(cardioStretching.userId, userId)),
    )
    .all();
}

export async function getCardioStretchingById(id: number) {
  const rows = await db
    .select()
    .from(cardioStretching)
    .where(eq(cardioStretching.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCardioStretchingByCategory(
  category: string,
  userId: string,
) {
  return db
    .select()
    .from(cardioStretching)
    .where(
      and(
        eq(cardioStretching.category, category),
        or(
          isNull(cardioStretching.userId),
          eq(cardioStretching.userId, userId),
        ),
      ),
    )
    .all();
}

export async function getCardioStretchingByTargetMuscle(
  targetMuscle: string,
  userId: string,
) {
  return db
    .select()
    .from(cardioStretching)
    .where(
      and(
        eq(cardioStretching.targetMuscle, targetMuscle),
        or(
          isNull(cardioStretching.userId),
          eq(cardioStretching.userId, userId),
        ),
      ),
    )
    .all();
}

export async function searchCardioStretching(query: string, userId?: string) {
  const conditions = userId
    ? and(
        like(cardioStretching.name, `%${query}%`),
        or(
          isNull(cardioStretching.userId),
          eq(cardioStretching.userId, userId),
        ),
      )
    : like(cardioStretching.name, `%${query}%`);

  return db.select().from(cardioStretching).where(conditions).all();
}
