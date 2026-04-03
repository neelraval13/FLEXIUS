// src/components/workout/completion-badge.tsx

import type React from "react";
import { Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompletionBadgeProps {
  completed: boolean;
}

const CompletionBadge: React.FC<CompletionBadgeProps> = ({ completed }) => {
  if (completed) {
    return (
      <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
        <Check className="h-3 w-3" />
        Logged
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 text-xs font-normal text-muted-foreground"
    >
      <Circle className="h-3 w-3" />
      Pending
    </Badge>
  );
};

export default CompletionBadge;
