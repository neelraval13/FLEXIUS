import type React from "react";
import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: string;
}

const colorMap: Record<string, string> = {
  beginner:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
  intermediate:
    "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20",
};

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const normalized = difficulty.toLowerCase();
  const classes = colorMap[normalized] ?? colorMap["beginner"];

  return (
    <Badge variant="outline" className={classes}>
      {difficulty}
    </Badge>
  );
};

export default DifficultyBadge;
