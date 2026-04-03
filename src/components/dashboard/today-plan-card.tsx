"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, MessageCircle, ChevronRight } from "lucide-react";

interface TodayPlanCardProps {
  plan: {
    title: string | null;
    totalExercises: number;
    completedExercises: number;
  } | null;
}

const TodayPlanCard: React.FC<TodayPlanCardProps> = ({ plan }) => {
  if (!plan) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <ClipboardList className="text-muted-foreground h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            No workout plan for today
          </p>
          <Link href="/chat" className={buttonVariants({ size: "sm" })}>
            <MessageCircle className="mr-1.5 h-4 w-4" />
            Create with AI Coach
          </Link>
        </CardContent>
      </Card>
    );
  }

  const pct =
    plan.totalExercises > 0
      ? Math.round((plan.completedExercises / plan.totalExercises) * 100)
      : 0;

  const allDone = plan.completedExercises === plan.totalExercises;

  return (
    <Link href="/workout/today" className="block">
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">
            {plan.title || "Today's Workout"}
          </CardTitle>
          <ChevronRight className="text-muted-foreground h-5 w-5" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={pct} className="h-2" />
          <p className="text-muted-foreground text-xs">
            {allDone
              ? "✅ All exercises completed!"
              : `${plan.completedExercises}/${plan.totalExercises} exercises done`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TodayPlanCard;
