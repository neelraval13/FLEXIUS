// src/components/log/types.ts
export interface SelectableExercise {
  id: number;
  name: string;
  targetMuscle: string;
  source: "exercise" | "cardio_stretching";
  category?: string;
  muscleGroup?: string;
}

export type ExerciseType = "strength" | "cardio" | "core" | "stretching";

export interface SetEntry {
  id: string;
  reps: number;
  weight: number;
}

export function getExerciseType(exercise: SelectableExercise): ExerciseType {
  if (exercise.source === "exercise") return "strength";
  if (exercise.category === "Cardio") return "cardio";
  if (exercise.category === "Core" || exercise.category === "Obliques") {
    return "core";
  }
  return "stretching";
}
