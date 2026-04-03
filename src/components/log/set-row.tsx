// src/components/log/set-row.tsx
"use client";

import type React from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { SetEntry } from "@/types/logs";

interface SetRowProps {
  index: number;
  entry: SetEntry;
  showWeight: boolean;
  canRemove: boolean;
  onChange: (id: string, field: "reps" | "weight", value: number) => void;
  onRemove: (id: string) => void;
}

const SetRow: React.FC<SetRowProps> = ({
  index,
  entry,
  showWeight,
  canRemove,
  onChange,
  onRemove,
}) => {
  return (
    <div className="flex items-end gap-2">
      <span className="text-muted-foreground flex h-9 shrink-0 items-center text-sm font-medium">
        Set {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        {index === 0 && (
          <Label className="text-xs text-muted-foreground">Reps</Label>
        )}
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          value={entry.reps || ""}
          onChange={(e) =>
            onChange(entry.id, "reps", parseInt(e.target.value) || 0)
          }
          placeholder="12"
          className="h-9"
        />
      </div>
      {showWeight && (
        <div className="min-w-0 flex-1">
          {index === 0 && (
            <Label className="text-xs text-muted-foreground">Weight</Label>
          )}
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={entry.weight || ""}
            onChange={(e) =>
              onChange(entry.id, "weight", parseFloat(e.target.value) || 0)
            }
            placeholder="0"
            className="h-9"
          />
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => onRemove(entry.id)}
        disabled={!canRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SetRow;
