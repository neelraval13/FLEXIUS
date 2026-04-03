import type React from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No exercises found.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
      <SearchX className="h-10 w-10" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
