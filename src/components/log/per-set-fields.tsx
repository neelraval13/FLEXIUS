// src/components/log/per-set-fields.tsx
"use client";

import type React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SetEntry } from "@/types/logs";
import SetRow from "./set-row";

interface PerSetFieldsProps {
  entries: SetEntry[];
  showWeight: boolean;
  onChange: (id: string, field: "reps" | "weight", value: number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

const PerSetFields: React.FC<PerSetFieldsProps> = ({
  entries,
  showWeight,
  onChange,
  onAdd,
  onRemove,
}) => {
  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <SetRow
          key={entry.id}
          index={index}
          entry={entry}
          showWeight={showWeight}
          canRemove={entries.length > 1}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onAdd}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Set
      </Button>
    </div>
  );
};

export default PerSetFields;
