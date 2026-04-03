import type React from "react";
import { CalendarX } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No workouts found.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <CalendarX className="h-12 w-12" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
