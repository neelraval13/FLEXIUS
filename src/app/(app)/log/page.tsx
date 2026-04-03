// src/app/(app)/log/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllExercises } from "@/db/queries/exercises";
import { getAllCardioStretching } from "@/db/queries/cardio-stretching";
import WorkoutLogForm from "@/components/log/workout-log-form";
import type { SelectableExercise } from "@/types/logs";

export const metadata: Metadata = {
  title: "Log Workout",
};

interface LogPageProps {
  searchParams: Promise<{
    exerciseId?: string;
    source?: string;
    returnTo?: string;
  }>;
}

const LogPage: React.FC<LogPageProps> = async ({ searchParams }) => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { exerciseId, source, returnTo } = await searchParams;

  const [allExercises, allCardioStretching] = await Promise.all([
    getAllExercises(),
    getAllCardioStretching(),
  ]);

  const exercises: SelectableExercise[] = allExercises.map((e) => ({
    id: e.id,
    name: e.name,
    targetMuscle: e.targetMuscle,
    source: "exercise" as const,
    muscleGroup: e.muscleGroup,
  }));

  const cardioExercises: SelectableExercise[] = allCardioStretching.map(
    (e) => ({
      id: e.id,
      name: e.name,
      targetMuscle: e.targetMuscle,
      source: "cardio_stretching" as const,
      category: e.category,
    }),
  );

  let preselectedExercise: SelectableExercise | undefined;

  if (exerciseId && source) {
    const id = Number(exerciseId);
    if (!Number.isNaN(id)) {
      preselectedExercise =
        source === "exercise"
          ? exercises.find((e) => e.id === id)
          : cardioExercises.find((e) => e.id === id);
    }
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      <h1 className="text-2xl font-bold">Log Workout</h1>
      <WorkoutLogForm
        exercises={exercises}
        cardioExercises={cardioExercises}
        preselectedExercise={preselectedExercise}
        returnTo={returnTo}
      />
    </div>
  );
};

export default LogPage;
