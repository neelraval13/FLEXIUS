"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface DayCellProps {
  day: number | null;
  hasLogs: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

const DayCell: React.FC<DayCellProps> = ({
  day,
  hasLogs,
  isSelected,
  isToday,
  onClick,
}) => {
  if (day === null) {
    return <div />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-full flex-col items-center justify-center rounded-md text-sm transition-colors",
        isSelected
          ? "bg-primary text-primary-foreground"
          : isToday
            ? "bg-accent font-semibold"
            : "hover:bg-accent/50",
      )}
    >
      {day}
      {hasLogs && (
        <span
          className={cn(
            "absolute bottom-1 h-1.5 w-1.5 rounded-full",
            isSelected ? "bg-primary-foreground" : "bg-primary",
          )}
        />
      )}
    </button>
  );
};

export default DayCell;
