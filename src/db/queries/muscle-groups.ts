import { eq, or, isNull, and } from "drizzle-orm";
import { db } from "@/db";
import { muscleGroups } from "@/db/schema";

/** Return shared (seed) muscle groups + this user's private ones */
export async function getAllMuscleGroups(userId: string) {
  return db
    .select()
    .from(muscleGroups)
    .where(or(isNull(muscleGroups.userId), eq(muscleGroups.userId, userId)))
    .all();
}

export async function getMuscleGroupById(id: number) {
  const rows = await db
    .select()
    .from(muscleGroups)
    .where(eq(muscleGroups.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getMuscleGroupsByMajorGroup(
  majorGroup: string,
  userId: string,
) {
  return db
    .select()
    .from(muscleGroups)
    .where(
      and(
        eq(muscleGroups.majorGroup, majorGroup),
        or(isNull(muscleGroups.userId), eq(muscleGroups.userId, userId)),
      ),
    )
    .all();
}

export async function getDistinctMajorGroups(userId: string) {
  const rows = await db
    .selectDistinct({ majorGroup: muscleGroups.majorGroup })
    .from(muscleGroups)
    .where(or(isNull(muscleGroups.userId), eq(muscleGroups.userId, userId)))
    .all();
  return rows.map((r) => r.majorGroup);
}
