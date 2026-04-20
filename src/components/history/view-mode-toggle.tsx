"use client";

import type React from "react";
import { Calendar, List } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    <ToggleGroup
      value={[viewMode]}
      onValueChange={(values) => {
        const next = values[0] as ViewMode | undefined;
        if (next) onChangeViewMode(next);
      }}
      className="rounded-lg"
    >
      <ToggleGroupItem value="calendar" aria-label="Calendar view">
        <Calendar className="h-3.5 w-3.5" />
        Calendar
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-3.5 w-3.5" />
        List
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewModeToggle;
