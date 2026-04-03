// src/app/actions/workout-plan-actions.ts
"use server";

import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workoutPlans, workoutPlanExercises, workoutLogs } from "@/db/schema";
import { auth } from "@/lib/auth";

interface PlanExerciseInput {
  exerciseId: number;
  exerciseSource: string;
  orderIndex: number;
  sets?: number;
  reps?: number;
  targetWeight?: number;
  unit?: string;
  restSeconds?: number;
  notes?: string;
}

interface CreateWorkoutPlanInput {
  date: string;
  title?: string;
  notes?: string;
  exercises: PlanExerciseInput[];
}

const getAuthenticatedUserId = async (): Promise<string> => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
};

/** Verify a plan belongs to the current user, return plan or throw */
const verifyPlanOwnership = async (planId: number, userId: string) => {
  const [plan] = await db
    .select()
    .from(workoutPlans)
    .where(and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)))
    .limit(1);

  if (!plan) throw new Error("Plan not found");
  return plan;
};

/** Verify a plan exercise belongs to a plan owned by the current user */
const verifyPlanExerciseOwnership = async (
  planExerciseId: number,
  userId: string,
) => {
  const [row] = await db
    .select({
      id: workoutPlanExercises.id,
      planId: workoutPlanExercises.planId,
      exerciseId: workoutPlanExercises.exerciseId,
      exerciseSource: workoutPlanExercises.exerciseSource,
      orderIndex: workoutPlanExercises.orderIndex,
      sets: workoutPlanExercises.sets,
      reps: workoutPlanExercises.reps,
      targetWeight: workoutPlanExercises.targetWeight,
      unit: workoutPlanExercises.unit,
      restSeconds: workoutPlanExercises.restSeconds,
      notes: workoutPlanExercises.notes,
      completed: workoutPlanExercises.completed,
    })
    .from(workoutPlanExercises)
    .innerJoin(workoutPlans, eq(workoutPlanExercises.planId, workoutPlans.id))
    .where(
      and(
        eq(workoutPlanExercises.id, planExerciseId),
        eq(workoutPlans.userId, userId),
      ),
    )
    .limit(1);

  if (!row) throw new Error("Plan exercise not found");
  return row;
};

export const createWorkoutPlan = async (input: CreateWorkoutPlanInput) => {
  const userId = await getAuthenticatedUserId();

  // Delete existing plan for this user + date
  const existing = await db
    .select({ id: workoutPlans.id })
    .from(workoutPlans)
    .where(
      and(eq(workoutPlans.userId, userId), eq(workoutPlans.date, input.date)),
    )
    .limit(1);

  if (existing[0]) {
    await db.delete(workoutPlans).where(eq(workoutPlans.id, existing[0].id));
  }

  const [plan] = await db
    .insert(workoutPlans)
    .values({
      userId,
      date: input.date,
      title: input.title,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    })
    .returning();

  if (input.exercises.length > 0) {
    await db.insert(workoutPlanExercises).values(
      input.exercises.map((ex) => ({
        planId: plan.id,
        exerciseId: ex.exerciseId,
        exerciseSource: ex.exerciseSource as "exercise" | "cardio_stretching",
        orderIndex: ex.orderIndex,
        sets: ex.sets,
        reps: ex.reps,
        targetWeight: ex.targetWeight,
        unit: (ex.unit ?? "kg") as "kg" | "lbs",
        restSeconds: ex.restSeconds,
        notes: ex.notes,
      })),
    );
  }

  revalidatePath("/workout/today");
  revalidatePath("/");

  return { success: true, planId: plan.id };
};

export const deleteWorkoutPlan = async (id: number) => {
  const userId = await getAuthenticatedUserId();
  await verifyPlanOwnership(id, userId);

  await db
    .delete(workoutPlans)
    .where(and(eq(workoutPlans.id, id), eq(workoutPlans.userId, userId)));

  revalidatePath("/workout/today");
  revalidatePath("/");

  return { success: true };
};

export const markPlanExerciseCompleted = async (id: number) => {
  const userId = await getAuthenticatedUserId();
  const exercise = await verifyPlanExerciseOwnership(id, userId);

  const newValue = exercise.completed === 1 ? 0 : 1;

  await db
    .update(workoutPlanExercises)
    .set({ completed: newValue })
    .where(eq(workoutPlanExercises.id, id));

  revalidatePath("/workout/today");

  return { success: true, completed: newValue === 1 };
};

export const quickLogFromPlan = async (planExerciseId: number) => {
  const userId = await getAuthenticatedUserId();
  const planExercise = await verifyPlanExerciseOwnership(
    planExerciseId,
    userId,
  );

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Calcutta",
  });

  await db.insert(workoutLogs).values({
    userId,
    exerciseId: planExercise.exerciseId,
    exerciseSource: planExercise.exerciseSource as
      | "exercise"
      | "cardio_stretching",
    performedAt: today,
    sets: planExercise.sets,
    reps: planExercise.reps,
    weight: planExercise.targetWeight,
    unit: (planExercise.unit ?? "kg") as "kg" | "lbs",
    notes: planExercise.notes
      ? `From plan: ${planExercise.notes}`
      : "Logged from today's plan",
  });

  await db
    .update(workoutPlanExercises)
    .set({ completed: 1 })
    .where(eq(workoutPlanExercises.id, planExerciseId));

  revalidatePath("/workout/today");
  revalidatePath("/history");
  revalidatePath("/");
  revalidatePath(`/exercises/${planExercise.exerciseId}`);

  return { success: true };
};

// ─── Plan Modification Actions ───────────────────────────────────────

interface AddPlanExerciseInput {
  exerciseId: number;
  exerciseSource: "exercise" | "cardio_stretching";
  sets?: number;
  reps?: number;
  targetWeight?: number;
  unit?: string;
  restSeconds?: number;
  notes?: string;
}

export const addExercisesToPlan = async (
  planId: number,
  exercises: AddPlanExerciseInput[],
) => {
  const userId = await getAuthenticatedUserId();
  await verifyPlanOwnership(planId, userId);

  const [result] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${workoutPlanExercises.orderIndex}), -1)`,
    })
    .from(workoutPlanExercises)
    .where(eq(workoutPlanExercises.planId, planId));

  let nextOrder = (result?.maxOrder ?? -1) + 1;

  const rows = exercises.map((ex) => ({
    planId,
    exerciseId: ex.exerciseId,
    exerciseSource: ex.exerciseSource as "exercise" | "cardio_stretching",
    orderIndex: nextOrder++,
    sets: ex.sets ?? null,
    reps: ex.reps ?? null,
    targetWeight: ex.targetWeight ?? null,
    unit: (ex.unit ?? "kg") as "kg" | "lbs",
    restSeconds: ex.restSeconds ?? null,
    notes: ex.notes ?? null,
    completed: 0,
  }));

  await db.insert(workoutPlanExercises).values(rows);

  revalidatePath("/workout/today");
  revalidatePath("/");

  return { success: true, added: rows.length };
};

export const removeExerciseFromPlan = async (planExerciseId: number) => {
  const userId = await getAuthenticatedUserId();
  await verifyPlanExerciseOwnership(planExerciseId, userId);

  await db
    .delete(workoutPlanExercises)
    .where(eq(workoutPlanExercises.id, planExerciseId));

  revalidatePath("/workout/today");
  revalidatePath("/");

  return { success: true };
};

export const replacePlanExercise = async (
  planExerciseId: number,
  newExercise: AddPlanExerciseInput,
) => {
  const userId = await getAuthenticatedUserId();
  await verifyPlanExerciseOwnership(planExerciseId, userId);

  await db
    .update(workoutPlanExercises)
    .set({
      exerciseId: newExercise.exerciseId,
      exerciseSource: newExercise.exerciseSource as
        | "exercise"
        | "cardio_stretching",
      sets: newExercise.sets ?? null,
      reps: newExercise.reps ?? null,
      targetWeight: newExercise.targetWeight ?? null,
      unit: (newExercise.unit ?? "kg") as "kg" | "lbs",
      restSeconds: newExercise.restSeconds ?? null,
      notes: newExercise.notes ?? null,
      completed: 0,
    })
    .where(eq(workoutPlanExercises.id, planExerciseId));

  revalidatePath("/workout/today");
  revalidatePath("/");

  return { success: true };
};
