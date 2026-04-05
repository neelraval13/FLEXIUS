import type React from "react";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-brand-amber/10 px-3 py-1.5">
      <Flame className="h-4 w-4 text-brand-amber" />
      <span className="text-sm font-semibold text-brand-amber">
        {streak} day{streak !== 1 ? "s" : ""} streak
      </span>
    </div>
  );
};

export default StreakBadge;
