// src/app/(app)/workout/today/page.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTodayPlan } from "@/db/queries/workout-plans";
import { getAllExercises, getAllCardioStretching } from "@/db/queries";
import WorkoutEmptyState from "@/components/workout/empty-state";
import TodayPlan from "@/components/workout/today-plan";
import PlanChatBubble from "@/components/workout/plan-chat-bubble";
import { buildPlanContext } from "@/lib/plan-context";
import type { TodayPlanData, PlanExerciseDetail } from "@/types/workout-plan";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Workout",
};

const WorkoutTodayPage: React.FC = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [plan, exercises, cardioStretching] = await Promise.all([
    getTodayPlan(userId),
    getAllExercises(),
    getAllCardioStretching(),
  ]);

  if (!plan) {
    return <WorkoutEmptyState />;
  }

  // Build lookup maps for resolving exercise details
  const exerciseMap = new Map(
    exercises.map((e) => [
      `exercise:${e.id}`,
      { name: e.name, targetMuscle: e.targetMuscle, videoUrl: e.videoUrl },
    ]),
  );
  const cardioMap = new Map(
    cardioStretching.map((e) => [
      `cardio_stretching:${e.id}`,
      { name: e.name, targetMuscle: e.targetMuscle, videoUrl: e.videoUrl },
    ]),
  );

  const planExercises: PlanExerciseDetail[] = plan.exercises.map((pe) => {
    const key = `${pe.exerciseSource}:${pe.exerciseId}`;
    const details = exerciseMap.get(key) ?? cardioMap.get(key);

    return {
      id: pe.id,
      exerciseId: pe.exerciseId,
      exerciseSource: pe.exerciseSource as "exercise" | "cardio_stretching",
      orderIndex: pe.orderIndex,
      name: details?.name ?? "Unknown Exercise",
      targetMuscle: details?.targetMuscle ?? "Unknown",
      videoUrl: details?.videoUrl ?? null,
      sets: pe.sets,
      reps: pe.reps,
      targetWeight: pe.targetWeight,
      unit: pe.unit ?? "kg",
      restSeconds: pe.restSeconds,
      notes: pe.notes,
      completed: pe.completed === 1,
    };
  });

  const todayPlanData: TodayPlanData = {
    id: plan.id,
    date: plan.date,
    title: plan.title,
    notes: plan.notes,
    createdAt: plan.createdAt,
    exercises: planExercises,
  };

  const planContext = buildPlanContext(todayPlanData);

  return (
    <>
      <TodayPlan plan={todayPlanData} />
      <PlanChatBubble planContext={planContext} />
    </>
  );
};

export default WorkoutTodayPage;
