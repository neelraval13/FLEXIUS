// src/app/api/pr/route.ts
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";

export interface PRResult {
  isPR: boolean;
  type: "weight" | "reps" | "duration" | null;
  previous: number | null;
  current: number | null;
}

export const POST = async (req: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { exerciseId, source, weight, durationMinutes } =
      (await req.json()) as {
        exerciseId: number;
        source: string;
        weight: number | null;
        reps: number | null;
        durationMinutes: number | null;
      };

    const userId = session.user.id;

    // The max includes the log we just inserted, so we need to check if
    // the current value IS the max (meaning it beat or tied the previous).
    // For a true PR, current must be strictly greater than all *previous* values.
    // Since the just-logged value is already in the DB, the previous max
    // is the second-highest. Instead, we count how many logs have this max value.

    // Simpler approach: get all logs, the max is the current PR.
    // If the just-logged value equals the max AND there's only one log at that max
    // (the one we just inserted), it's a new PR.

    // Even simpler: we check if weight > previous best (excluding current log).
    // But we don't have the current log's ID. So let's just check:
    // if the current value equals the overall max, and there were previous logs,
    // it's likely a PR. For first-time exercises, it's always a PR.

    // Cleanest approach: check if current value > second-highest value
    // OR if this is the first log with weight data

    if (weight != null && weight > 0) {
      const allWeights = await db
        .select({ weight: workoutLogs.weight })
        .from(workoutLogs)
        .where(
          and(
            eq(workoutLogs.userId, userId),
            eq(workoutLogs.exerciseId, exerciseId),
            eq(workoutLogs.exerciseSource, source),
          ),
        );

      const previousWeights = allWeights
        .map((r) => r.weight ?? 0)
        .sort((a, b) => b - a);

      // If only one entry, it's the first log — always a PR
      if (previousWeights.length <= 1) {
        return Response.json({
          isPR: true,
          type: "weight",
          previous: null,
          current: weight,
        });
      }

      // Second highest = previous PR (index 1 since index 0 might be current)
      const previousBest =
        previousWeights[0] === weight ? previousWeights[1] : previousWeights[0];

      if (weight > (previousBest ?? 0)) {
        return Response.json({
          isPR: true,
          type: "weight",
          previous: previousBest,
          current: weight,
        });
      }
    }

    if (durationMinutes != null && durationMinutes > 0) {
      const allDurations = await db
        .select({ duration: workoutLogs.durationMinutes })
        .from(workoutLogs)
        .where(
          and(
            eq(workoutLogs.userId, userId),
            eq(workoutLogs.exerciseId, exerciseId),
            eq(workoutLogs.exerciseSource, source),
          ),
        );

      const previousDurations = allDurations
        .map((r) => r.duration ?? 0)
        .sort((a, b) => b - a);

      if (previousDurations.length <= 1) {
        return Response.json({
          isPR: true,
          type: "duration",
          previous: null,
          current: durationMinutes,
        });
      }

      const previousBest =
        previousDurations[0] === durationMinutes
          ? previousDurations[1]
          : previousDurations[0];

      if (durationMinutes > (previousBest ?? 0)) {
        return Response.json({
          isPR: true,
          type: "duration",
          previous: previousBest,
          current: durationMinutes,
        });
      }
    }

    return Response.json({
      isPR: false,
      type: null,
      previous: null,
      current: null,
    });
  } catch (error) {
    console.error("PR check error:", error);
    return Response.json({
      isPR: false,
      type: null,
      previous: null,
      current: null,
    });
  }
};
