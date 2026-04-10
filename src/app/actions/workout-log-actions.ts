// src/app/actions/workout-log-actions.ts
"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { autoCompletePlanExercise } from "@/lib/plan-completion";

interface WorkoutLogInput {
  exerciseId: number;
  exerciseSource: "exercise" | "cardio_stretching";
  performedAt: string;
  sets: number;
  reps: number;
  weight: number | null;
  unit: "kg" | "lbs";
  durationMinutes: number | null;
  notes: string | null;
}

const getAuthenticatedUserId = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
};

export async function createWorkoutLog(input: WorkoutLogInput) {
  const userId = await getAuthenticatedUserId();

  const result = await db
    .insert(workoutLogs)
    .values({
      userId,
      exerciseId: input.exerciseId,
      exerciseSource: input.exerciseSource,
      performedAt: input.performedAt,
      sets: input.sets,
      reps: input.reps,
      weight: input.weight,
      unit: input.unit,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
    })
    .returning();

  await autoCompletePlanExercise({
    userId,
    exerciseId: input.exerciseId,
    exerciseSource: input.exerciseSource,
    performedAt: input.performedAt,
  });

  revalidatePath("/workout/today");
  revalidatePath("/history");
  revalidatePath("/");
  revalidatePath(`/exercises/${input.exerciseId}`);
  return result[0];
}

export async function updateWorkoutLog(
  id: number,
  input: Partial<WorkoutLogInput>,
) {
  const userId = await getAuthenticatedUserId();

  // Verify ownership
  const [existing] = await db
    .select({ id: workoutLogs.id })
    .from(workoutLogs)
    .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)))
    .limit(1);

  if (!existing) throw new Error("Log not found");

  const values: Record<string, unknown> = {};

  if (input.exerciseId !== undefined) values.exerciseId = input.exerciseId;
  if (input.exerciseSource !== undefined)
    values.exerciseSource = input.exerciseSource;
  if (input.performedAt !== undefined) values.performedAt = input.performedAt;
  if (input.sets !== undefined) values.sets = input.sets;
  if (input.reps !== undefined) values.reps = input.reps;
  if (input.weight !== undefined) values.weight = input.weight;
  if (input.unit !== undefined) values.unit = input.unit;
  if (input.durationMinutes !== undefined)
    values.durationMinutes = input.durationMinutes;
  if (input.notes !== undefined) values.notes = input.notes;

  const result = await db
    .update(workoutLogs)
    .set(values)
    .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)))
    .returning();

  revalidatePath("/history");
  revalidatePath("/");
  return result[0] ?? null;
}

export async function deleteWorkoutLog(id: number) {
  const userId = await getAuthenticatedUserId();

  // Verify ownership + get exercise info for revalidation
  const [log] = await db
    .select()
    .from(workoutLogs)
    .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)))
    .limit(1);

  if (!log) throw new Error("Log not found");

  await db
    .delete(workoutLogs)
    .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)));

  revalidatePath("/history");
  revalidatePath("/");
  revalidatePath(`/exercises/${log.exerciseId}`);
}

export async function createBatchWorkoutLogs(
  inputs: {
    exerciseId: number;
    exerciseSource: "exercise" | "cardio_stretching";
    performedAt: string;
    sets: number;
    reps: number;
    weight: number | null;
    unit: "kg" | "lbs" | null;
    durationMinutes: number | null;
    notes: string | null;
  }[],
) {
  const userId = await getAuthenticatedUserId();

  for (const input of inputs) {
    await db.insert(workoutLogs).values({
      userId,
      exerciseId: input.exerciseId,
      exerciseSource: input.exerciseSource,
      performedAt: input.performedAt,
      sets: input.sets,
      reps: input.reps,
      weight: input.weight,
      unit: input.unit,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
    });

    await autoCompletePlanExercise({
      userId,
      exerciseId: input.exerciseId,
      exerciseSource: input.exerciseSource,
      performedAt: input.performedAt,
    });
  }

  revalidatePath("/history");
  revalidatePath("/workout/today");
  revalidatePath("/");
  if (inputs.length > 0) {
    revalidatePath(`/exercises/${inputs[0].exerciseId}`);
  }
}
