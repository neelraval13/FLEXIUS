// src/actions/favorite-actions.ts
"use server";

import { db } from "@/db";
import { favoriteExercises } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(
  exerciseId: number,
  source: "exercise" | "cardio_stretching",
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existing = await db
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

  if (existing.length > 0) {
    await db
      .delete(favoriteExercises)
      .where(eq(favoriteExercises.id, existing[0].id));
  } else {
    await db.insert(favoriteExercises).values({
      userId,
      exerciseId,
      source,
      createdAt: new Date().toISOString(),
    });
  }

  revalidatePath("/exercises");
}
