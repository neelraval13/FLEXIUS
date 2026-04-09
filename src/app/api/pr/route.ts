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

    // Get all existing logs for this exercise (BEFORE the new log is inserted)
    const existingLogs = await db
      .select({
        weight: workoutLogs.weight,
        duration: workoutLogs.durationMinutes,
      })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          eq(workoutLogs.exerciseId, exerciseId),
          eq(workoutLogs.exerciseSource, source),
        ),
      );

    // Weight PR check
    if (weight != null && weight > 0) {
      const previousBest = existingLogs.reduce(
        (max, log) => Math.max(max, log.weight ?? 0),
        0,
      );

      // First time logging this exercise with weight → PR
      if (existingLogs.length === 0) {
        return Response.json({
          isPR: true,
          type: "weight",
          previous: null,
          current: weight,
        });
      }

      // Strictly greater than all previous weights → PR
      if (weight > previousBest) {
        return Response.json({
          isPR: true,
          type: "weight",
          previous: previousBest,
          current: weight,
        });
      }
    }

    // Duration PR check
    if (durationMinutes != null && durationMinutes > 0) {
      const previousBest = existingLogs.reduce(
        (max, log) => Math.max(max, log.duration ?? 0),
        0,
      );

      if (existingLogs.length === 0) {
        return Response.json({
          isPR: true,
          type: "duration",
          previous: null,
          current: durationMinutes,
        });
      }

      if (durationMinutes > previousBest) {
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
