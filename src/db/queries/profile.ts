// src/db/queries/profile.ts

import { eq, and } from "drizzle-orm";
import { db } from "@/db"; // ← ADJUST to match your actual db import
import {
  userProfiles,
  favoriteExercises,
  exercises,
  cardioStretching,
} from "@/db/schema"; // ← ADJUST if your other query files use a different path
import type { FavoriteExercise } from "@/types/profile";

type ExerciseSource = "exercise" | "cardio_stretching";

const now = () => new Date().toISOString();

// ── Profile ──

export const getProfile = async (userId: string) => {
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);
  return profile ?? null;
};

export const upsertProfile = async (
  userId: string,
  data: {
    name: string;
    height: number | null;
    weight: number | null;
    heightUnit: string;
    weightUnit: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    fitnessGoal?: string | null;
  },
) => {
  const existing = await getProfile(userId);
  const timestamp = now();

  if (existing) {
    await db
      .update(userProfiles)
      .set({ ...data, updatedAt: timestamp })
      .where(eq(userProfiles.id, userId));
  } else {
    await db.insert(userProfiles).values({
      id: userId,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  return getProfile(userId);
};

// ── Favorites ──

export const getFavorites = async (
  userId: string,
): Promise<FavoriteExercise[]> => {
  const favs = await db
    .select()
    .from(favoriteExercises)
    .where(eq(favoriteExercises.userId, userId));

  const enriched: FavoriteExercise[] = await Promise.all(
    favs.map(
      async (fav: {
        id: number;
        userId: string;
        exerciseId: number;
        source: ExerciseSource;
        createdAt: string;
      }): Promise<FavoriteExercise> => {
        if (fav.source === "exercise") {
          const [ex] = await db
            .select({
              name: exercises.name,
              targetMuscle: exercises.targetMuscle,
            })
            .from(exercises)
            .where(eq(exercises.id, fav.exerciseId))
            .limit(1);
          return {
            id: fav.id,
            exerciseId: fav.exerciseId,
            source: fav.source,
            name: ex?.name ?? "Unknown",
            targetMuscle: ex?.targetMuscle ?? "",
          };
        } else {
          const [cs] = await db
            .select({
              name: cardioStretching.name,
              targetMuscle: cardioStretching.targetMuscle,
            })
            .from(cardioStretching)
            .where(eq(cardioStretching.id, fav.exerciseId))
            .limit(1);
          return {
            id: fav.id,
            exerciseId: fav.exerciseId,
            source: fav.source,
            name: cs?.name ?? "Unknown",
            targetMuscle: cs?.targetMuscle ?? "",
          };
        }
      },
    ),
  );

  return enriched;
};

export const toggleFavorite = async (
  userId: string,
  exerciseId: number,
  source: ExerciseSource,
): Promise<boolean> => {
  const [existing] = await db
    .select()
    .from(favoriteExercises)
    .where(
      and(
        eq(favoriteExercises.userId, userId),
        eq(favoriteExercises.exerciseId, exerciseId),
        eq(favoriteExercises.source, source),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(favoriteExercises)
      .where(eq(favoriteExercises.id, existing.id));
    return false;
  } else {
    await db.insert(favoriteExercises).values({
      userId,
      exerciseId,
      source,
      createdAt: now(),
    });
    return true;
  }
};

export const getFavoriteIds = async (userId: string): Promise<Set<string>> => {
  const favs = await db
    .select({
      exerciseId: favoriteExercises.exerciseId,
      source: favoriteExercises.source,
    })
    .from(favoriteExercises)
    .where(eq(favoriteExercises.userId, userId));

  return new Set(
    favs.map(
      (f: { exerciseId: number; source: ExerciseSource }) =>
        `${f.source}:${f.exerciseId}`,
    ),
  );
};
