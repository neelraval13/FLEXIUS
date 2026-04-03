// src/components/workout/rest-badge.tsx

import type React from "react";
import { Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RestBadgeProps {
  seconds: number;
}

const RestBadge: React.FC<RestBadgeProps> = ({ seconds }) => {
  const label =
    seconds >= 60 ? `${Math.round(seconds / 60)}m rest` : `${seconds}s rest`;

  return (
    <Badge variant="outline" className="gap-1 text-xs font-normal">
      <Timer className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default RestBadge;
