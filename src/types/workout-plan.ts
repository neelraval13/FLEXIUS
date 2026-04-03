// src/types/workout-plan.ts

export interface PlanExerciseDetail {
  id: number;
  exerciseId: number;
  exerciseSource: "exercise" | "cardio_stretching";
  orderIndex: number;
  name: string;
  targetMuscle: string;
  videoUrl: string | null;
  sets: number | null;
  reps: number | null;
  targetWeight: number | null;
  unit: string;
  restSeconds: number | null;
  notes: string | null;
  completed: boolean;
}

export interface TodayPlanData {
  id: number;
  date: string;
  title: string | null;
  notes: string | null;
  createdAt: string;
  exercises: PlanExerciseDetail[];
}
