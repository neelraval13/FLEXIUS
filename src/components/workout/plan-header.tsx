// src/components/workout/plan-header.tsx

import type React from "react";
import PlanProgress from "./plan-progress";

interface PlanHeaderProps {
  title: string | null;
  date: string;
  notes: string | null;
  completedCount: number;
  totalCount: number;
}

const PlanHeader: React.FC<PlanHeaderProps> = ({
  title,
  date,
  notes,
  completedCount,
  totalCount,
}) => {
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    },
  );

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
        <h1 className="font-heading text-xl font-bold">
          {title ?? "Today's Workout"}
        </h1>
        {notes && <p className="mt-1 text-sm text-muted-foreground">{notes}</p>}
      </div>
      <PlanProgress completed={completedCount} total={totalCount} />
    </div>
  );
};

export default PlanHeader;
