// src/db/queries/workout-logs.ts

import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "@/db";
import { workoutLogs, exercises, cardioStretching } from "@/db/schema";

export async function getAllWorkoutLogs(userId: string) {
  return db
    .select()
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.performedAt))
    .all();
}

export async function getWorkoutLogById(userId: string, id: number) {
  const rows = await db
    .select()
    .from(workoutLogs)
    .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getWorkoutLogsByDate(userId: string, date: string) {
  return db
    .select()
    .from(workoutLogs)
    .where(
      and(eq(workoutLogs.userId, userId), eq(workoutLogs.performedAt, date)),
    )
    .orderBy(workoutLogs.id)
    .all();
}

export async function getWorkoutLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  return db
    .select()
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.performedAt, startDate),
        lte(workoutLogs.performedAt, endDate),
      ),
    )
    .orderBy(desc(workoutLogs.performedAt))
    .all();
}

export async function getWorkoutLogsByExercise(
  userId: string,
  exerciseId: number,
  source: "exercise" | "cardio_stretching",
) {
  return db
    .select()
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        eq(workoutLogs.exerciseId, exerciseId),
        eq(workoutLogs.exerciseSource, source),
      ),
    )
    .orderBy(desc(workoutLogs.performedAt))
    .all();
}

export async function getWorkoutLogsWithExerciseName(
  userId: string,
  date?: string,
) {
  const allLogs = date
    ? await getWorkoutLogsByDate(userId, date)
    : await getAllWorkoutLogs(userId);

  const enriched = await Promise.all(
    allLogs.map(async (log) => {
      let exerciseName = "Unknown";

      if (log.exerciseSource === "exercise") {
        const rows = await db
          .select({ name: exercises.name })
          .from(exercises)
          .where(eq(exercises.id, log.exerciseId))
          .limit(1);
        exerciseName = rows[0]?.name ?? "Unknown";
      } else {
        const rows = await db
          .select({ name: cardioStretching.name })
          .from(cardioStretching)
          .where(eq(cardioStretching.id, log.exerciseId))
          .limit(1);
        exerciseName = rows[0]?.name ?? "Unknown";
      }

      return { ...log, exerciseName };
    }),
  );

  return enriched;
}

export async function getDistinctLogDates(userId: string) {
  const rows = await db
    .selectDistinct({ performedAt: workoutLogs.performedAt })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.performedAt))
    .all();
  return rows.map((r) => r.performedAt);
}
