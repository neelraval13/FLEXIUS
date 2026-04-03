// src/components/profile/favorites-list.tsx

"use client";

import { useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions/profile-actions";
import { Heart, Dumbbell, Timer } from "lucide-react";
import Link from "next/link";
import type { FavoriteExercise } from "@/types/profile";

interface FavoritesListProps {
  favorites: FavoriteExercise[];
}

export function FavoritesList({ favorites }: FavoritesListProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove(exerciseId: number, source: string) {
    startTransition(async () => {
      await toggleFavoriteAction(
        exerciseId,
        source as "exercise" | "cardio_stretching",
      );
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">
        Favorite Exercises
        {favorites.length > 0 && (
          <span className="ml-2 text-sm font-normal text-neutral-400">
            ({favorites.length})
          </span>
        )}
      </h2>

      {favorites.length === 0 ? (
        <div className="rounded-2xl bg-neutral-900 p-6 text-center">
          <Heart className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
          <p className="text-sm text-neutral-400">
            No favorites yet. Tap the heart icon on any exercise to add it here.
          </p>
          <Link
            href="/exercises"
            className="mt-3 inline-block text-sm font-medium text-blue-500"
          >
            Browse Exercises →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {favorites.map((fav) => (
            <div
              key={`${fav.source}:${fav.exerciseId}`}
              className="flex items-center justify-between rounded-xl bg-neutral-900 p-3"
            >
              <Link
                href={`/exercises/${fav.exerciseId}?source=${fav.source}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800">
                  {fav.source === "exercise" ? (
                    <Dumbbell className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Timer className="h-4 w-4 text-green-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {fav.name}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    {fav.targetMuscle}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(fav.exerciseId, fav.source)}
                disabled={isPending}
                className="ml-2 shrink-0 p-1.5 text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
