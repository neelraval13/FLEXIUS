// src/db/queries/workout-plans.ts

import { eq, and, desc } from "drizzle-orm";
import { db } from "..";
import { workoutPlans, workoutPlanExercises } from "../schema";

export const getPlanByDate = async (userId: string, date: string) => {
  const plans = await db
    .select()
    .from(workoutPlans)
    .where(and(eq(workoutPlans.userId, userId), eq(workoutPlans.date, date)))
    .limit(1);

  const plan = plans[0];
  if (!plan) return null;

  const exercises = await db
    .select()
    .from(workoutPlanExercises)
    .where(eq(workoutPlanExercises.planId, plan.id))
    .orderBy(workoutPlanExercises.orderIndex);

  return { ...plan, exercises };
};

export const getTodayPlan = async (userId: string) => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Calcutta",
  });
  return getPlanByDate(userId, today);
};

export const getPlanExerciseById = async (id: number) => {
  const rows = await db
    .select()
    .from(workoutPlanExercises)
    .where(eq(workoutPlanExercises.id, id))
    .limit(1);

  return rows[0] ?? null;
};

export const getRecentPlans = async (userId: string, limit = 7) => {
  return db
    .select()
    .from(workoutPlans)
    .where(eq(workoutPlans.userId, userId))
    .orderBy(desc(workoutPlans.date))
    .limit(limit);
};

export const findPendingPlanExercise = async (
  userId: string,
  exerciseId: number,
  exerciseSource: string,
): Promise<{ id: number } | undefined> => {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Calcutta",
  });

  const result = await db
    .select({ planExerciseId: workoutPlanExercises.id })
    .from(workoutPlanExercises)
    .innerJoin(workoutPlans, eq(workoutPlanExercises.planId, workoutPlans.id))
    .where(
      and(
        eq(workoutPlans.userId, userId),
        eq(workoutPlans.date, today),
        eq(workoutPlanExercises.exerciseId, exerciseId),
        eq(workoutPlanExercises.exerciseSource, exerciseSource),
        eq(workoutPlanExercises.completed, 0),
      ),
    )
    .limit(1);

  return result[0] ? { id: result[0].planExerciseId } : undefined;
};
