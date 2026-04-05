// src/components/workout/workout-with-timer.tsx
"use client";

import type React from "react";
import { RestTimerProvider } from "./rest-timer-context";
import RestTimerOverlay from "./rest-timer-overlay";
import TodayPlan from "./today-plan";
import PlanChatBubble from "./plan-chat-bubble";
import type { TodayPlanData } from "@/types/workout-plan";

interface WorkoutWithTimerProps {
  plan: TodayPlanData;
  planContext: string;
}

const WorkoutWithTimer: React.FC<WorkoutWithTimerProps> = ({
  plan,
  planContext,
}) => {
  return (
    <RestTimerProvider>
      <TodayPlan plan={plan} />
      <RestTimerOverlay />
      <PlanChatBubble planContext={planContext} />
    </RestTimerProvider>
  );
};

export default WorkoutWithTimer;
