// src/app/(app)/exercises/[id]/page.tsx
import type React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getExerciseById,
  getCardioStretchingById,
  getWorkoutLogsByExercise,
} from "@/db/queries";
import ExerciseDetail from "@/components/exercises/exercise-detail";
import type { ExerciseDetailData } from "@/components/exercises/exercise-detail";
import type { WorkoutLogEntry } from "@/components/exercises/history-chart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exercise Details",
};

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}

function parseEquipment(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item: string | { name: string }) =>
        typeof item === "string" ? item : item.name,
      );
    }
    return [];
  } catch {
    return [];
  }
}

function parseAlternatives(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const ExerciseDetailPage: React.FC<ExerciseDetailPageProps> = async ({
  params,
  searchParams,
}) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const { id } = await params;
  const { source } = await searchParams;

  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) notFound();

  const exerciseSource =
    source === "cardio_stretching" ? "cardio_stretching" : "exercise";

  const [exerciseRow, logs] = await Promise.all([
    exerciseSource === "cardio_stretching"
      ? getCardioStretchingById(numericId)
      : getExerciseById(numericId),
    getWorkoutLogsByExercise(userId, numericId, exerciseSource),
  ]);

  if (!exerciseRow) notFound();

  const exercise: ExerciseDetailData = {
    id: exerciseRow.id,
    name: exerciseRow.name,
    targetMuscle: exerciseRow.targetMuscle,
    muscleGroupOrCategory:
      exerciseSource === "cardio_stretching"
        ? (exerciseRow as { category: string }).category
        : (exerciseRow as { muscleGroup: string }).muscleGroup,
    groupLabel:
      exerciseSource === "cardio_stretching" ? "Category" : "Muscle Group",
    difficulty: exerciseRow.difficulty,
    equipment: parseEquipment(exerciseRow.equipmentUsed),
    alternatives: parseAlternatives(exerciseRow.alternatives),
    videoUrl: exerciseRow.videoUrl,
    source: exerciseSource,
  };

  const logEntries: WorkoutLogEntry[] = logs.map((log) => ({
    id: log.id,
    performedAt: log.performedAt,
    sets: log.sets,
    reps: log.reps,
    weight: log.weight,
    unit: log.unit,
    durationMinutes: log.durationMinutes,
    notes: log.notes,
  }));

  return (
    <div className="mx-auto max-w-2xl p-4">
      <ExerciseDetail exercise={exercise} logs={logEntries} />
    </div>
  );
};

export default ExerciseDetailPage;
