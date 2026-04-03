import { eq, like } from "drizzle-orm";
import { db } from "@/db";
import { exercises } from "@/db/schema";

export async function getAllExercises() {
  return db.select().from(exercises).all();
}

export async function getExerciseById(id: number) {
  const rows = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getExercisesByMuscleGroup(muscleGroup: string) {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.muscleGroup, muscleGroup))
    .all();
}

export async function getExercisesByTargetMuscle(targetMuscle: string) {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.targetMuscle, targetMuscle))
    .all();
}

export async function searchExercises(query: string) {
  return db
    .select()
    .from(exercises)
    .where(like(exercises.name, `%${query}%`))
    .all();
}
