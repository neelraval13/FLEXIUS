// src/components/workout/plan-cacher.tsx
"use client";

import { useEffect } from "react";
import { cacheTodayPlan } from "@/lib/plan-cache";
import type { TodayPlanData } from "@/types/workout-plan";

interface PlanCacherProps {
  plan: TodayPlanData;
}

const PlanCacher: React.FC<PlanCacherProps> = ({ plan }) => {
  useEffect(() => {
    cacheTodayPlan(plan).catch((err) => {
      console.warn("Failed to cache plan for offline use:", err);
    });
  }, [plan]);

  return null;
};

export default PlanCacher;
