// src/components/workout/quick-log-button.tsx

"use client";

import type React from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2, Dumbbell, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { quickLogFromPlan } from "@/app/actions/workout-plan-actions";
import type { PlanExerciseDetail } from "@/types/workout-plan";

interface QuickLogButtonProps {
  exercise: PlanExerciseDetail;
}

const QuickLogButton: React.FC<QuickLogButtonProps> = ({ exercise }) => {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  if (exercise.completed) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-emerald-500">
        <Check className="h-4 w-4" />
        <span className="font-medium">Done</span>
      </div>
    );
  }

  const handleConfirm = () => {
    startTransition(async () => {
      await quickLogFromPlan(exercise.id);
      setShowConfirm(false);
    });
  };

  if (showConfirm) {
    const parts: string[] = [];
    if (exercise.sets) parts.push(`${exercise.sets}`);
    if (exercise.reps) parts.push(`×${exercise.reps}`);
    if (exercise.targetWeight) {
      parts.push(`@ ${exercise.targetWeight}${exercise.unit}`);
    }
    const summary = parts.join(" ");

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Log{summary ? ` ${summary}` : ""}?
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            )}
            Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Link
            href={`/log?exerciseId=${exercise.exerciseId}&source=${exercise.exerciseSource}&returnTo=/workout/today`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
            })}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={() => setShowConfirm(true)}>
      <Dumbbell className="mr-1.5 h-3.5 w-3.5" />
      Log
    </Button>
  );
};

export default QuickLogButton;
