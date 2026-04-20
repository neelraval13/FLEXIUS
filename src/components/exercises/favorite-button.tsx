// src/components/exercises/favorite-button.tsx
"use client";

import type React from "react";
import { useTransition } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/app/actions/favorite-actions";

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
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          isFavorite
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-red-400",
        )}
      />
    </Button>
  );
};

export default FavoriteButton;
