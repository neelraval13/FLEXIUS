import { eq } from "drizzle-orm";
import { db } from "@/db";
import { muscleGroups } from "@/db/schema";

export async function getAllMuscleGroups() {
  return db.select().from(muscleGroups).all();
}

export async function getMuscleGroupById(id: number) {
  const rows = await db
    .select()
    .from(muscleGroups)
    .where(eq(muscleGroups.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getMuscleGroupsByMajorGroup(majorGroup: string) {
  return db
    .select()
    .from(muscleGroups)
    .where(eq(muscleGroups.majorGroup, majorGroup))
    .all();
}

export async function getDistinctMajorGroups() {
  const rows = await db
    .selectDistinct({ majorGroup: muscleGroups.majorGroup })
    .from(muscleGroups)
    .all();
  return rows.map((r) => r.majorGroup);
}
