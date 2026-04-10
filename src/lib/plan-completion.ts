// src/lib/plan-completion.ts
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { workoutPlans, workoutPlanExercises } from "@/db/schema";

/**
 * Mark a specific plan exercise row as completed.
 * Returns true if a row was updated.
 */
export const markPlanExerciseCompleted = async (
  planExerciseId: number,
): Promise<boolean> => {
  const result = await db
    .update(workoutPlanExercises)
    .set({ completed: 1 })
    .where(eq(workoutPlanExercises.id, planExerciseId));
  return (result.rowsAffected ?? 0) > 0;
};

/**
 * Auto-complete a plan exercise after a workout log is inserted.
 *
 * Strategy:
 *  - If `planExerciseId` is provided explicitly, mark that row directly.
 *  - Otherwise, look up the user's plan for `performedAt` and find a
 *    matching pending exercise to mark completed.
 *
 * Returns true if a row was updated. Errors are caught and logged
 * (auto-completion failure should never break the underlying log insert).
 */
export const autoCompletePlanExercise = async (params: {
  userId: string;
  exerciseId: number;
  exerciseSource: string;
  performedAt: string;
  planExerciseId?: number | null;
}): Promise<boolean> => {
  try {
    // Explicit ID path — caller already knows which plan row to mark
    if (params.planExerciseId != null) {
      return await markPlanExerciseCompleted(params.planExerciseId);
    }

    // Auto-match path — find the plan for this date for this user
    const [plan] = await db
      .select({ id: workoutPlans.id })
      .from(workoutPlans)
      .where(
        and(
          eq(workoutPlans.userId, params.userId),
          eq(workoutPlans.date, params.performedAt),
        ),
      )
      .limit(1);

    if (!plan) return false;

    // Find a matching uncompleted plan exercise
    const [match] = await db
      .select({ id: workoutPlanExercises.id })
      .from(workoutPlanExercises)
      .where(
        and(
          eq(workoutPlanExercises.planId, plan.id),
          eq(workoutPlanExercises.exerciseId, params.exerciseId),
          eq(workoutPlanExercises.exerciseSource, params.exerciseSource),
          eq(workoutPlanExercises.completed, 0),
        ),
      )
      .limit(1);

    if (!match) return false;

    return await markPlanExerciseCompleted(match.id);
  } catch (err) {
    console.error("autoCompletePlanExercise failed:", err);
    return false;
  }
};
