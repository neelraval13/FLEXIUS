// src/components/exercises/exercise-card.tsx
import type React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Target } from "lucide-react";
import DifficultyBadge from "./difficulty-badge";
import FavoriteButton from "./favorite-button";

export interface ExerciseCardData {
  id: number;
  name: string;
  targetMuscle: string;
  muscleGroup: string | null;
  category: string | null;
  equipmentUsed: string | null;
  difficulty: string;
  source: "exercise" | "cardio_stretching";
  isFavorite: boolean;
}

interface ExerciseCardProps {
  exercise: ExerciseCardData;
}

const parseEquipment = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const equipment = parseEquipment(exercise.equipmentUsed);

  return (
    <Link
      href={`/exercises/${exercise.id}?source=${exercise.source}`}
      className="block"
    >
      <Card className="hover:border-primary/40 h-full transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm leading-tight">
              {exercise.name}
            </CardTitle>
            <div className="flex shrink-0 items-center gap-1">
              <FavoriteButton
                exerciseId={exercise.id}
                source={exercise.source}
                isFavorite={exercise.isFavorite}
              />
              <DifficultyBadge difficulty={exercise.difficulty} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="h-3.5 w-3.5 shrink-0" />
            <span>{exercise.targetMuscle}</span>
          </div>
          {equipment.length > 0 && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Dumbbell className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {equipment.slice(0, 2).map((eq) => (
                  <Badge
                    key={eq}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {eq}
                  </Badge>
                ))}
                {equipment.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    +{equipment.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default ExerciseCard;
