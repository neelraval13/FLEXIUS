// src/db/queries/muscle-heatmap.ts

import { eq, and, gte, lte, or, isNull } from "drizzle-orm";
import { getWeekRangeForTimezone } from "@/lib/user-timezone";
import { db } from "@/db";
import { workoutLogs, exercises, cardioStretching } from "@/db/schema";

export interface MuscleHeatmapData {
  [group: string]: number; // muscle group -> total sets
}

export async function getWeeklyMuscleHeatmap(
  userId: string,
  timezone = "Asia/Kolkata",
): Promise<MuscleHeatmapData> {
  const { start: startDate, end: endDate } = getWeekRangeForTimezone(timezone);

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.performedAt, startDate),
        lte(workoutLogs.performedAt, endDate),
      ),
    )
    .all();

  const heatmap: MuscleHeatmapData = {};

  // Build lookup maps (shared + user's own exercises)
  const allExercises = await db
    .select()
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, userId)))
    .all();
  const allCardio = await db
    .select()
    .from(cardioStretching)
    .where(
      or(isNull(cardioStretching.userId), eq(cardioStretching.userId, userId)),
    )
    .all();

  const exerciseMap = new Map(
    allExercises.map((e) => [`exercise:${e.id}`, e.muscleGroup]),
  );
  const cardioMap = new Map(
    allCardio.map((e) => [`cardio_stretching:${e.id}`, e.category]),
  );

  for (const log of logs) {
    const key = `${log.exerciseSource}:${log.exerciseId}`;
    const group = exerciseMap.get(key) ?? cardioMap.get(key);

    if (group) {
      // Normalize group names
      const normalized = normalizeGroup(group);
      if (normalized) {
        heatmap[normalized] = (heatmap[normalized] ?? 0) + (log.sets ?? 1);
      }
    }
  }

  return heatmap;
}

function normalizeGroup(group: string): string | null {
  const lower = group.toLowerCase();

  if (lower.includes("chest")) return "Chest";
  if (lower.includes("back")) return "Back";
  if (lower.includes("shoulder") || lower.includes("delt")) return "Shoulders";
  if (lower.includes("bicep")) return "Biceps";
  if (lower.includes("tricep")) return "Triceps";
  if (
    lower.includes("leg") ||
    lower.includes("quad") ||
    lower.includes("hamstring") ||
    lower.includes("glute") ||
    lower.includes("calf")
  )
    return "Legs";
  if (lower.includes("core") || lower.includes("ab")) return "Core";
  if (lower.includes("cardio") || lower.includes("stretching")) return "Cardio";

  return group;
}
