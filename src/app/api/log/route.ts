// src/app/api/log/route.ts
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workoutLogs, workoutPlans, workoutPlanExercises } from "@/db/schema";

interface LogPayload {
  exerciseId: number;
  exerciseSource: "exercise" | "cardio_stretching";
  performedAt: string;
  sets: number;
  reps: number;
  weight: number | null;
  unit: "kg" | "lbs" | null;
  durationMinutes: number | null;
  notes: string | null;
}

const autoCompletePlanExercise = async (
  userId: string,
  exerciseId: number,
  exerciseSource: string,
  performedAt: string,
) => {
  try {
    // Find the plan for this date
    const plan = await db
      .select({ id: workoutPlans.id })
      .from(workoutPlans)
      .where(
        and(
          eq(workoutPlans.userId, userId),
          eq(workoutPlans.date, performedAt),
        ),
      )
      .limit(1);

    if (!plan[0]) return;

    // Find a matching uncompleted plan exercise
    const match = await db
      .select({ id: workoutPlanExercises.id })
      .from(workoutPlanExercises)
      .where(
        and(
          eq(workoutPlanExercises.planId, plan[0].id),
          eq(workoutPlanExercises.exerciseId, exerciseId),
          eq(workoutPlanExercises.exerciseSource, exerciseSource),
          eq(workoutPlanExercises.completed, 0),
        ),
      )
      .limit(1);

    if (!match[0]) return;

    await db
      .update(workoutPlanExercises)
      .set({ completed: 1 })
      .where(eq(workoutPlanExercises.id, match[0].id));
  } catch (err) {
    console.error("Auto-complete plan exercise failed:", err);
  }
};

export const POST = async (req: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { logs: LogPayload[] };

    if (!body.logs?.length) {
      return Response.json({ error: "No logs provided" }, { status: 400 });
    }

    const userId = session.user.id;
    let synced = 0;

    for (const log of body.logs) {
      await db.insert(workoutLogs).values({
        userId,
        exerciseId: log.exerciseId,
        exerciseSource: log.exerciseSource,
        performedAt: log.performedAt,
        sets: log.sets,
        reps: log.reps,
        weight: log.weight,
        unit: log.unit,
        durationMinutes: log.durationMinutes,
        notes: log.notes ? `${log.notes} (synced offline)` : "(synced offline)",
      });

      // Mark the matching plan exercise as completed
      await autoCompletePlanExercise(
        userId,
        log.exerciseId,
        log.exerciseSource,
        log.performedAt,
      );

      synced++;
    }

    revalidatePath("/history");
    revalidatePath("/workout/today");
    revalidatePath("/");

    return Response.json({ success: true, synced });
  } catch (error) {
    console.error("Log sync error:", error);
    return Response.json({ error: "Failed to sync logs" }, { status: 500 });
  }
};
