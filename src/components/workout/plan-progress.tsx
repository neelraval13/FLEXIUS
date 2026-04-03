// src/components/workout/plan-progress.tsx

import type React from "react";

interface PlanProgressProps {
  completed: number;
  total: number;
}

const PlanProgress: React.FC<PlanProgressProps> = ({ completed, total }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completed}/{total} exercises done
        </span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default PlanProgress;
