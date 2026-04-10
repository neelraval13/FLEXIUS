// src/components/workout/today-plan.tsx

"use client";

import type React from "react";
import Link from "next/link";
import { RefreshCw, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import PlanHeader from "./plan-header";
import PlanExerciseCard from "./plan-exercise-card";
import { deleteWorkoutPlan } from "@/app/actions/workout-plan-actions";
import type { TodayPlanData } from "@/types/workout-plan";

interface TodayPlanProps {
  plan: TodayPlanData;
  timezone?: string;
}

const TodayPlan: React.FC<TodayPlanProps> = ({ plan, timezone }) => {
  const [isPending, startTransition] = useTransition();

  const completedCount = plan.exercises.filter((e) => e.completed).length;
  const allDone =
    plan.exercises.length > 0 && completedCount === plan.exercises.length;

  const handleDelete = () => {
    if (!confirm("Delete this workout plan?")) return;
    startTransition(async () => {
      await deleteWorkoutPlan(plan.id);
    });
  };

  return (
    <div className="space-y-4 p-4">
      <PlanHeader
        title={plan.title}
        date={plan.date}
        notes={plan.notes}
        completedCount={completedCount}
        totalCount={plan.exercises.length}
      />

      {allDone && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <p className="text-lg font-bold text-emerald-500">🎉 All Done!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Great work today, Neel. Every rep counts.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {plan.exercises.map((exercise) => (
          <PlanExerciseCard
            key={exercise.id}
            exercise={exercise}
            timezone={timezone}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <Link
          href="/chat"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          New Plan
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete Plan
        </Button>
      </div>
    </div>
  );
};

export default TodayPlan;
