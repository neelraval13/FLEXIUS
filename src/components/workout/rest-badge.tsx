// src/components/workout/rest-badge.tsx

"use client";

import type React from "react";
import { Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRestTimer } from "./rest-timer-context";

interface RestBadgeProps {
  seconds: number;
  exerciseName: string;
}

const RestBadge: React.FC<RestBadgeProps> = ({ seconds, exerciseName }) => {
  const { startTimer } = useRestTimer();

  const label =
    seconds >= 60 ? `${Math.round(seconds / 60)}m rest` : `${seconds}s rest`;

  return (
    <Badge
      variant="outline"
      className="cursor-pointer gap-1 text-xs font-normal transition-colors hover:bg-primary/10 hover:text-primary"
      onClick={() => startTimer(seconds, exerciseName)}
    >
      <Timer className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default RestBadge;
