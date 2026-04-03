"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface MuscleGroupFilterProps {
  groups: string[];
  selected: string;
  onSelect: (group: string) => void;
}

const MuscleGroupFilter: React.FC<MuscleGroupFilterProps> = ({
  groups,
  selected,
  onSelect,
}) => {
  const all = ["All", ...groups];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {all.map((group) => {
          const isActive =
            group === "All" ? selected === "All" : selected === group;
          return (
            <Button
              key={group}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(group)}
              className="shrink-0"
            >
              {group}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default MuscleGroupFilter;
