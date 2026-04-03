// src/components/exercises/favorite-button.tsx
"use client";

import type React from "react";
import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorite-actions";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  exerciseId: number;
  source: "exercise" | "cardio_stretching";
  isFavorite: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  exerciseId,
  source,
  isFavorite,
}) => {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    startTransition(() => toggleFavorite(exerciseId, source));
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "rounded-full p-1 transition-colors",
        "hover:bg-muted/50 disabled:opacity-50",
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorite
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-red-400",
        )}
      />
    </button>
  );
};

export default FavoriteButton;
