// src/lib/weekly-report.ts
import { eq, and, gte, lte, lt } from "drizzle-orm";
import { getWeekRangeForTimezone } from "@/lib/user-timezone";
import { getUserTimezone } from "@/db/queries/profile";
import { db } from "@/db";
import { workoutLogs, exercises, cardioStretching, users } from "@/db/schema";
import { getWorkoutStreak } from "@/db/queries/dashboard";

export interface WeeklyReport {
  userName: string;
  weekStart: string;
  weekEnd: string;
  workoutDays: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
  streak: number;
  muscleGroupsHit: string[];
  muscleGroupsMissed: string[];
  prs: { exerciseName: string; weight: number; unit: string }[];
  prevWeek: {
    workoutDays: number;
    totalExercises: number;
    totalVolume: number;
  } | null;
}

const ALL_MAJOR_GROUPS = [
  "Chest",
  "Back",
  "Shoulder",
  "Bicep",
  "Tricep",
  "Leg",
];

const getWeekRange = (weeksAgo: number = 0, timezone = "Asia/Kolkata") => {
  return getWeekRangeForTimezone(timezone, weeksAgo);
};

const getLogsForRange = async (userId: string, start: string, end: string) => {
  return db
    .select()
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.performedAt, start),
        lte(workoutLogs.performedAt, end),
      ),
    )
    .all();
};

const getStatsFromLogs = (
  logs: Awaited<ReturnType<typeof getLogsForRange>>,
) => {
  const uniqueDays = new Set(logs.map((l) => l.performedAt));
  const totalSets = logs.reduce((sum, l) => sum + (l.sets ?? 0), 0);
  const totalVolume = logs.reduce(
    (sum, l) => sum + (l.weight ?? 0) * (l.sets ?? 1) * (l.reps ?? 1),
    0,
  );

  return {
    workoutDays: uniqueDays.size,
    totalExercises: logs.length,
    totalSets,
    totalVolume: Math.round(totalVolume),
  };
};

export const generateWeeklyReport = async (
  userId: string,
): Promise<WeeklyReport> => {
  const timezone = await getUserTimezone(userId);
  const thisWeek = getWeekRange(0, timezone);
  const lastWeek = getWeekRange(1, timezone);

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Batch-fetch all exercise + cardio metadata once (used for both muscle
  // group resolution AND PR name resolution below)
  const [allExercises, allCardio, currentLogs, previousLogs, streak] =
    await Promise.all([
      db
        .select({
          id: exercises.id,
          name: exercises.name,
          muscleGroup: exercises.muscleGroup,
        })
        .from(exercises)
        .all(),
      db
        .select({
          id: cardioStretching.id,
          name: cardioStretching.name,
        })
        .from(cardioStretching)
        .all(),
      getLogsForRange(userId, thisWeek.start, thisWeek.end),
      getLogsForRange(userId, lastWeek.start, lastWeek.end),
      getWorkoutStreak(userId),
    ]);

  const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));
  const cardioMap = new Map(allCardio.map((e) => [e.id, e]));

  const currentStats = getStatsFromLogs(currentLogs);
  const prevStats = getStatsFromLogs(previousLogs);

  // Resolve muscle groups for this week's exercises (in-memory lookup)
  const muscleGroupsHit = new Set<string>();
  for (const log of currentLogs) {
    if (log.exerciseSource === "exercise") {
      const ex = exerciseMap.get(log.exerciseId);
      if (ex?.muscleGroup) muscleGroupsHit.add(ex.muscleGroup);
    }
  }

  const hitArray = [...muscleGroupsHit];
  const missedArray = ALL_MAJOR_GROUPS.filter((g) => !muscleGroupsHit.has(g));

  // Detect PRs: build map of this week's max weight per (source, exerciseId)
  const strengthLogs = currentLogs.filter(
    (l) => l.weight != null && l.weight > 0,
  );
  const exerciseWeightMap = new Map<string, { weight: number; unit: string }>();

  for (const log of strengthLogs) {
    const key = `${log.exerciseSource}:${log.exerciseId}`;
    const existing = exerciseWeightMap.get(key);
    if (!existing || log.weight! > existing.weight) {
      exerciseWeightMap.set(key, {
        weight: log.weight!,
        unit: log.unit ?? "kg",
      });
    }
  }

  // Batch-fetch ALL pre-week logs for the exercises we care about,
  // then compute previous max per exercise in-memory
  const previousMaxMap = new Map<string, number>();

  if (exerciseWeightMap.size > 0) {
    const allPrevLogs = await db
      .select({
        exerciseId: workoutLogs.exerciseId,
        exerciseSource: workoutLogs.exerciseSource,
        weight: workoutLogs.weight,
      })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          lt(workoutLogs.performedAt, thisWeek.start),
        ),
      )
      .all();

    for (const log of allPrevLogs) {
      if (log.weight == null) continue;
      const key = `${log.exerciseSource}:${log.exerciseId}`;
      const current = previousMaxMap.get(key) ?? 0;
      if (log.weight > current) previousMaxMap.set(key, log.weight);
    }
  }

  // Build PRs list (in-memory comparisons + map lookups)
  const prs: WeeklyReport["prs"] = [];
  for (const [key, { weight, unit }] of exerciseWeightMap) {
    const prevMax = previousMaxMap.get(key) ?? 0;
    if (weight > prevMax) {
      const [source, idStr] = key.split(":");
      const exerciseId = parseInt(idStr, 10);
      const name =
        source === "exercise"
          ? (exerciseMap.get(exerciseId)?.name ?? "Unknown")
          : (cardioMap.get(exerciseId)?.name ?? "Unknown");

      prs.push({ exerciseName: name, weight, unit });
    }
  }

  return {
    userName: user?.name ?? "there",
    weekStart: thisWeek.start,
    weekEnd: thisWeek.end,
    ...currentStats,
    streak,
    muscleGroupsHit: hitArray,
    muscleGroupsMissed: missedArray,
    prs,
    prevWeek:
      previousLogs.length > 0
        ? {
            workoutDays: prevStats.workoutDays,
            totalExercises: prevStats.totalExercises,
            totalVolume: prevStats.totalVolume,
          }
        : null,
  };
};
