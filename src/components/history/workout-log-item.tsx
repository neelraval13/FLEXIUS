import type React from "react";
import { Dumbbell, Timer, StickyNote } from "lucide-react";

interface WorkoutLogItemProps {
  id: number;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  unit: string | null;
  durationMinutes: number | null;
  notes: string | null;
}

const WorkoutLogItem: React.FC<WorkoutLogItemProps> = ({
  exerciseName,
  sets,
  reps,
  weight,
  unit,
  durationMinutes,
  notes,
}) => {
  const hasStrengthData = sets !== null || reps !== null;
  const hasWeight = weight !== null && weight > 0;
  const hasDuration = durationMinutes !== null && durationMinutes > 0;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-card p-3">
      <p className="font-medium text-sm">{exerciseName}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {hasStrengthData && (
          <span className="flex items-center gap-1">
            <Dumbbell className="h-3.5 w-3.5" />
            {sets !== null && reps !== null
              ? `${sets} × ${reps}`
              : sets !== null
                ? `${sets} sets`
                : `${reps} reps`}
            {hasWeight && ` @ ${weight} ${unit ?? "kg"}`}
          </span>
        )}
        {hasDuration && (
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            {durationMinutes} min
          </span>
        )}
        {notes && (
          <span className="flex items-center gap-1">
            <StickyNote className="h-3.5 w-3.5" />
            {notes}
          </span>
        )}
      </div>
    </div>
  );
};

export default WorkoutLogItem;
