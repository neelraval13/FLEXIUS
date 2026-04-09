// src/app/(app)/exercises/page.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getAllExercises,
  getDistinctMajorGroups,
  getAllCardioStretching,
} from "@/db/queries";
import { getUserFavorites } from "@/db/queries/favorites";
import ExerciseBrowser from "@/components/exercises/exercise-browser";
import type { ExerciseCardData } from "@/components/exercises/exercise-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exercises",
};

type FavoriteSet = Set<string>;

const favKey = (id: number, source: "exercise" | "cardio_stretching"): string =>
  `${source}:${id}`;

const mapExercises = (
  rows: Awaited<ReturnType<typeof getAllExercises>>,
  favs: FavoriteSet,
): ExerciseCardData[] =>
  rows.map((row) => ({
    id: row.id,
    name: row.name,
    targetMuscle: row.targetMuscle,
    muscleGroup: row.muscleGroup,
    category: null,
    equipmentUsed: row.equipmentUsed,
    difficulty: row.difficulty,
    source: "exercise",
    isFavorite: favs.has(favKey(row.id, "exercise")),
  }));

const mapCardioStretching = (
  rows: Awaited<ReturnType<typeof getAllCardioStretching>>,
  favs: FavoriteSet,
): ExerciseCardData[] =>
  rows.map((row) => ({
    id: row.id,
    name: row.name,
    targetMuscle: row.targetMuscle,
    muscleGroup: null,
    category: row.category,
    equipmentUsed: row.equipmentUsed,
    difficulty: row.difficulty,
    source: "cardio_stretching",
    isFavorite: favs.has(favKey(row.id, "cardio_stretching")),
  }));

const ExercisesPage: React.FC = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [exerciseRows, cardioRows, majorGroups, favorites] = await Promise.all([
    getAllExercises(userId),
    getAllCardioStretching(userId),
    getDistinctMajorGroups(userId),
    getUserFavorites(userId),
  ]);

  const favSet: FavoriteSet = new Set(
    favorites.map((f) => favKey(f.exerciseId, f.source)),
  );

  const exercises = mapExercises(exerciseRows, favSet);
  const cardioStretching = mapCardioStretching(cardioRows, favSet);

  const cardioCategories = [...new Set(cardioRows.map((r) => r.category))];

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Exercises</h1>
      <ExerciseBrowser
        exercises={exercises}
        cardioStretching={cardioStretching}
        muscleGroups={majorGroups}
        cardioCategories={cardioCategories}
      />
    </div>
  );
};

export default ExercisesPage;
