// src/components/workout/workout-with-timer.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { RestTimerProvider } from "./rest-timer-context";
import RestTimerOverlay from "./rest-timer-overlay";
import TodayPlan from "./today-plan";
import PlanChatBubble from "./plan-chat-bubble";
import PRCelebration from "@/components/pr-celebration";
import type { TodayPlanData } from "@/types/workout-plan";

interface PRData {
  type: "weight" | "reps" | "duration";
  exerciseName: string;
  previous: number | null;
  current: number;
  unit: string;
}

interface WorkoutWithTimerProps {
  plan: TodayPlanData;
  planContext: string;
}

const WorkoutWithTimer: React.FC<WorkoutWithTimerProps> = ({
  plan,
  planContext,
}) => {
  const [prData, setPrData] = useState<PRData | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as PRData;
      setPrData(detail);
    };

    window.addEventListener("flexius-pr", handler);
    return () => window.removeEventListener("flexius-pr", handler);
  }, []);

  const dismissPR = useCallback(() => setPrData(null), []);

  return (
    <RestTimerProvider>
      {prData && (
        <PRCelebration
          type={prData.type}
          exerciseName={prData.exerciseName}
          previous={prData.previous}
          current={prData.current}
          unit={prData.unit}
          onDismiss={dismissPR}
        />
      )}
      <TodayPlan plan={plan} />
      <RestTimerOverlay />
      <PlanChatBubble planContext={planContext} />
    </RestTimerProvider>
  );
};

export default WorkoutWithTimer;
