// src/db/queries/dashboard.ts

import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";

export async function getWeeklyStats(userId: string) {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startDate = monday.toISOString().split("T")[0];
  const endDate = sunday.toISOString().split("T")[0];

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.performedAt, startDate),
        lte(workoutLogs.performedAt, endDate),
      ),
    );

  const uniqueDays = new Set(logs.map((l) => l.performedAt));
  const totalSets = logs.reduce((sum, l) => sum + (l.sets ?? 0), 0);
  const totalWeight = logs.reduce(
    (sum, l) => sum + (l.weight ?? 0) * (l.sets ?? 1) * (l.reps ?? 1),
    0,
  );

  return {
    workoutDays: uniqueDays.size,
    totalExercises: logs.length,
    totalSets,
    totalVolume: Math.round(totalWeight),
    weekStart: startDate,
    weekEnd: endDate,
  };
}

export async function getRecentLogs(userId: string, limit = 5) {
  const logs = await db
    .select({
      id: workoutLogs.id,
      exerciseId: workoutLogs.exerciseId,
      exerciseSource: workoutLogs.exerciseSource,
      performedAt: workoutLogs.performedAt,
      sets: workoutLogs.sets,
      reps: workoutLogs.reps,
      weight: workoutLogs.weight,
      unit: workoutLogs.unit,
      durationMinutes: workoutLogs.durationMinutes,
      notes: workoutLogs.notes,
    })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId))
    .orderBy(desc(workoutLogs.performedAt), desc(workoutLogs.id))
    .limit(limit);

  return logs;
}

export async function getWorkoutStreak(userId: string): Promise<number> {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const today = now.toISOString().split("T")[0];

  const dates = await db
    .selectDistinct({ date: workoutLogs.performedAt })
    .from(workoutLogs)
    .where(
      and(eq(workoutLogs.userId, userId), lte(workoutLogs.performedAt, today)),
    )
    .orderBy(desc(workoutLogs.performedAt));

  if (dates.length === 0) return 0;

  let streak = 0;
  const checkDate = new Date(today + "T00:00:00");

  // If today has no log, start checking from yesterday
  if (dates[0].date !== today) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (const { date } of dates) {
    const expected = checkDate.toISOString().split("T")[0];
    if (date === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (date < expected) {
      break;
    }
  }

  return streak;
}
