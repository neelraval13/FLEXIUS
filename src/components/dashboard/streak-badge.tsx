import type React from "react";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streak: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ streak }) => {
  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5">
      <Flame className="h-4 w-4 text-orange-500" />
      <span className="text-sm font-semibold text-orange-500">
        {streak} day{streak !== 1 ? "s" : ""} streak
      </span>
    </div>
  );
};

export default StreakBadge;
