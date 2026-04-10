// src/components/workout/plan-exercise-card.tsx

"use client";

import type React from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CompletionBadge from "./completion-badge";
import RestBadge from "./rest-badge";
import QuickLogButton from "./quick-log-button";
import VideoEmbed from "@/components/exercises/video-embed";
import type { PlanExerciseDetail } from "@/types/workout-plan";

interface PlanExerciseCardProps {
  exercise: PlanExerciseDetail;
  timezone?: string;
}

const PlanExerciseCard: React.FC<PlanExerciseCardProps> = ({
  exercise,
  timezone,
}) => {
  const [showVideo, setShowVideo] = useState(false);

  const parts: string[] = [];
  if (exercise.sets) parts.push(`${exercise.sets} sets`);
  if (exercise.reps) parts.push(`${exercise.reps} reps`);
  if (exercise.targetWeight) {
    parts.push(`${exercise.targetWeight} ${exercise.unit}`);
  }
  const prescriptionText = parts.join(" × ");

  return (
    <Card
      className={
        exercise.completed
          ? "border-emerald-500/20 bg-emerald-500/5"
          : undefined
      }
    >
      <CardContent className="space-y-3 p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {exercise.orderIndex + 1}
              </span>
              <h3 className="truncate font-semibold">{exercise.name}</h3>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              {exercise.targetMuscle}
            </div>
          </div>
          <CompletionBadge completed={exercise.completed} />
        </div>

        {/* Prescription */}
        {prescriptionText && (
          <p className="text-lg font-bold tracking-tight">{prescriptionText}</p>
        )}

        {/* Rest + badges row */}
        {exercise.restSeconds && (
          <div className="flex flex-wrap gap-2">
            <RestBadge
              seconds={exercise.restSeconds}
              exerciseName={exercise.name}
            />
          </div>
        )}

        {/* Coach notes */}
        {exercise.notes && (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-sm italic text-muted-foreground">
            💡 {exercise.notes}
          </p>
        )}

        {/* Video toggle */}
        {exercise.videoUrl && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0 text-xs text-muted-foreground"
              onClick={() => setShowVideo(!showVideo)}
            >
              {showVideo ? (
                <ChevronUp className="mr-1 h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="mr-1 h-3.5 w-3.5" />
              )}
              {showVideo ? "Hide video" : "Watch tutorial"}
            </Button>
            {showVideo && (
              <div className="mt-2">
                <VideoEmbed videoUrl={exercise.videoUrl} />
              </div>
            )}
          </div>
        )}

        {/* Quick log */}
        <div className="border-t pt-3">
          <QuickLogButton exercise={exercise} timezone={timezone} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanExerciseCard;
