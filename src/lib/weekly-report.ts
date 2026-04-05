// src/lib/weekly-report.ts
import { eq, and, gte, lte, desc, lt } from "drizzle-orm";
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

const getWeekRange = (weeksAgo: number = 0) => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) - weeksAgo * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
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
  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(1);

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [currentLogs, previousLogs, streak] = await Promise.all([
    getLogsForRange(userId, thisWeek.start, thisWeek.end),
    getLogsForRange(userId, lastWeek.start, lastWeek.end),
    getWorkoutStreak(userId),
  ]);

  const currentStats = getStatsFromLogs(currentLogs);
  const prevStats = getStatsFromLogs(previousLogs);

  // Resolve muscle groups for this week's exercises
  const exerciseIds = [
    ...new Set(
      currentLogs
        .filter((l) => l.exerciseSource === "exercise")
        .map((l) => l.exerciseId),
    ),
  ];

  const muscleGroupsHit = new Set<string>();

  if (exerciseIds.length > 0) {
    for (const exId of exerciseIds) {
      const [ex] = await db
        .select({ muscleGroup: exercises.muscleGroup })
        .from(exercises)
        .where(eq(exercises.id, exId))
        .limit(1);

      if (ex?.muscleGroup) {
        muscleGroupsHit.add(ex.muscleGroup);
      }
    }
  }

  const hitArray = [...muscleGroupsHit];
  const missedArray = ALL_MAJOR_GROUPS.filter((g) => !muscleGroupsHit.has(g));

  // Detect PRs this week: exercises where this week's max weight > all previous max weight
  const prs: WeeklyReport["prs"] = [];

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

  for (const [key, { weight, unit }] of exerciseWeightMap) {
    const [source, idStr] = key.split(":");
    const exerciseId = parseInt(idStr, 10);

    // Get all-time max weight BEFORE this week
    const previousMax = await db
      .select({ weight: workoutLogs.weight })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          eq(workoutLogs.exerciseId, exerciseId),
          eq(workoutLogs.exerciseSource, source),
          lt(workoutLogs.performedAt, thisWeek.start),
        ),
      )
      .orderBy(desc(workoutLogs.weight))
      .limit(1);

    const prevMax = previousMax[0]?.weight ?? 0;

    if (weight > prevMax) {
      // Get exercise name
      let name = "Unknown";
      if (source === "exercise") {
        const [ex] = await db
          .select({ name: exercises.name })
          .from(exercises)
          .where(eq(exercises.id, exerciseId))
          .limit(1);
        name = ex?.name ?? "Unknown";
      } else {
        const [ex] = await db
          .select({ name: cardioStretching.name })
          .from(cardioStretching)
          .where(eq(cardioStretching.id, exerciseId))
          .limit(1);
        name = ex?.name ?? "Unknown";
      }

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
