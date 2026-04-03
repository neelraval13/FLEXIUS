"use client";

import type React from "react";
import { Calendar, List } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "list";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onChangeViewMode,
}) => {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <button
        type="button"
        onClick={() => onChangeViewMode("calendar")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          viewMode === "calendar"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Calendar className="h-3.5 w-3.5" />
        Calendar
      </button>
      <button
        type="button"
        onClick={() => onChangeViewMode("list")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          viewMode === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="h-3.5 w-3.5" />
        List
      </button>
    </div>
  );
};

export default ViewModeToggle;
