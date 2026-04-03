import type React from "react";
import { Dumbbell, Target, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DifficultyBadge from "@/components/exercises/difficulty-badge";
import EquipmentList from "@/components/exercises/equipment-list";

interface ExerciseInfoSectionProps {
  targetMuscle: string;
  muscleGroupOrCategory: string;
  groupLabel: string;
  difficulty: string;
  equipment: string[];
}

const ExerciseInfoSection: React.FC<ExerciseInfoSectionProps> = ({
  targetMuscle,
  muscleGroupOrCategory,
  groupLabel,
  difficulty,
  equipment,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Exercise Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Target className="text-muted-foreground h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs">Target Muscle</p>
            <p className="text-sm font-medium">{targetMuscle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Layers className="text-muted-foreground h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground text-xs">{groupLabel}</p>
            <p className="text-sm font-medium">{muscleGroupOrCategory}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dumbbell className="text-muted-foreground h-4 w-4 shrink-0" />
          <div>
            <p className="text-muted-foreground mb-1 text-xs">Difficulty</p>
            <DifficultyBadge difficulty={difficulty} />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-1.5 text-xs">Equipment</p>
          <EquipmentList equipment={equipment} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseInfoSection;
