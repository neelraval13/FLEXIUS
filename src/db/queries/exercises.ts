import { eq, like, or, isNull, and } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";

/** Return shared (seed) exercises + this user's private exercises */
export async function getAllExercises(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, userId)))
    .all();
}

export async function getExerciseById(id: number) {
  const rows = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getExercisesByMuscleGroup(
  muscleGroup: string,
  userId: string,
) {
  return db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.muscleGroup, muscleGroup),
        or(isNull(exercises.userId), eq(exercises.userId, userId)),
      ),
    )
    .all();
}

export async function getExercisesByTargetMuscle(
  targetMuscle: string,
  userId: string,
) {
  return db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.targetMuscle, targetMuscle),
        or(isNull(exercises.userId), eq(exercises.userId, userId)),
      ),
    )
    .all();
}

export async function searchExercises(query: string, userId?: string) {
  const conditions = userId
    ? and(
        like(exercises.name, `%${query}%`),
        or(isNull(exercises.userId), eq(exercises.userId, userId)),
      )
    : like(exercises.name, `%${query}%`);

  return db.select().from(exercises).where(conditions).all();
}
