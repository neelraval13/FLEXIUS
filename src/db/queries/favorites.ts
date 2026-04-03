// src/db/queries/favorites.ts
import { db } from "@/db";
import { favoriteExercises } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getUserFavorites(userId: string) {
  return db
    .select({
      exerciseId: favoriteExercises.exerciseId,
      source: favoriteExercises.source,
    })
    .from(favoriteExercises)
    .where(eq(favoriteExercises.userId, userId));
}

export async function isFavorite(
  userId: string,
  exerciseId: number,
  source: "exercise" | "cardio_stretching",
) {
  const rows = await db
    .select({ id: favoriteExercises.id })
    .from(favoriteExercises)
    .where(
      and(
        eq(favoriteExercises.userId, userId),
        eq(favoriteExercises.exerciseId, exerciseId),
        eq(favoriteExercises.source, source),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
