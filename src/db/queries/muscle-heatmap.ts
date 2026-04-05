// src/db/queries/muscle-heatmap.ts

import { eq, and, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { workoutLogs, exercises, cardioStretching } from "@/db/schema";

export interface MuscleHeatmapData {
  [group: string]: number; // muscle group -> total sets
}

export async function getWeeklyMuscleHeatmap(
  userId: string,
): Promise<MuscleHeatmapData> {
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
    )
    .all();

  const heatmap: MuscleHeatmapData = {};

  // Build lookup maps
  const allExercises = await db.select().from(exercises).all();
  const allCardio = await db.select().from(cardioStretching).all();

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
