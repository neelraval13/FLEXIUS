import type React from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  message = "No results found",
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-muted-foreground">
      <Icon className="size-10 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default EmptyState;
