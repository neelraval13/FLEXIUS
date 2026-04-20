// src/components/profile/favorites-list.tsx

"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Heart, Dumbbell, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toggleFavoriteAction } from "@/app/actions/profile-actions";
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
      <h2 className="text-lg font-semibold">
        Favorite Exercises
        {favorites.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({favorites.length})
          </span>
        )}
      </h2>

      {favorites.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-2 text-center">
            <Heart className="mx-auto mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No favorites yet. Tap the heart icon on any exercise to add it
              here.
            </p>
            <Link
              href="/exercises"
              className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary/80"
            >
              Browse Exercises →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {favorites.map((fav) => (
            <Card
              key={`${fav.source}:${fav.exerciseId}`}
              className="flex-row items-center justify-between rounded-xl p-3"
            >
              <Link
                href={`/exercises/${fav.exerciseId}?source=${fav.source}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {fav.source === "exercise" ? (
                    <Dumbbell className="size-4 text-primary" />
                  ) : (
                    <Timer className="size-4 text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{fav.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {fav.targetMuscle}
                  </p>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(fav.exerciseId, fav.source)}
                disabled={isPending}
                className="ml-2 shrink-0 text-red-500 hover:text-red-400"
                aria-label="Remove from favorites"
              >
                <Heart className="size-4 fill-current" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
