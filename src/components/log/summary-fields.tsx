// src/components/log/summary-fields.tsx
"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ExerciseType } from "@/types/logs";

interface SummaryFieldsProps {
  exerciseType: ExerciseType;
  sets: number;
  reps: number;
  weight: number | "";
  unit: "kg" | "lbs";
  duration: number | "";
  onSetsChange: (val: number) => void;
  onRepsChange: (val: number) => void;
  onWeightChange: (val: number | "") => void;
  onUnitChange: (val: "kg" | "lbs") => void;
  onDurationChange: (val: number | "") => void;
}

const SummaryFields: React.FC<SummaryFieldsProps> = ({
  exerciseType,
  sets,
  reps,
  weight,
  unit,
  duration,
  onSetsChange,
  onRepsChange,
  onWeightChange,
  onUnitChange,
  onDurationChange,
}) => {
  const showSetsReps = exerciseType === "strength" || exerciseType === "core";
  const showWeight = exerciseType === "strength";
  const showOptionalWeight = exerciseType === "core";
  const showDuration =
    exerciseType === "cardio" || exerciseType === "stretching";

  return (
    <div className="space-y-4">
      {showSetsReps && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="sets">Sets</Label>
            <Input
              id="sets"
              type="number"
              inputMode="numeric"
              min={1}
              value={sets || ""}
              onChange={(e) => onSetsChange(parseInt(e.target.value) || 0)}
              placeholder="3"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reps">Reps</Label>
            <Input
              id="reps"
              type="number"
              inputMode="numeric"
              min={1}
              value={reps || ""}
              onChange={(e) => onRepsChange(parseInt(e.target.value) || 0)}
              placeholder="12"
            />
          </div>
        </div>
      )}

      {(showWeight || showOptionalWeight) && (
        <div className="flex gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor="weight">
              Weight{showOptionalWeight ? " (optional)" : ""}
            </Label>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={weight === "" ? "" : weight}
              onChange={(e) =>
                onWeightChange(
                  e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
                )
              }
              placeholder="0"
            />
          </div>
          <div className="w-20 space-y-1.5">
            <Label>Unit</Label>
            <div className="flex gap-0.5 rounded-md bg-muted p-0.5">
              <button
                type="button"
                className={`flex-1 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors ${
                  unit === "kg"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => onUnitChange("kg")}
              >
                kg
              </button>
              <button
                type="button"
                className={`flex-1 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors ${
                  unit === "lbs"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
                onClick={() => onUnitChange("lbs")}
              >
                lbs
              </button>
            </div>
          </div>
        </div>
      )}

      {showDuration && (
        <div className="space-y-1.5">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            inputMode="numeric"
            min={1}
            value={duration === "" ? "" : duration}
            onChange={(e) =>
              onDurationChange(
                e.target.value === "" ? "" : parseInt(e.target.value) || 0,
              )
            }
            placeholder="30"
          />
        </div>
      )}
    </div>
  );
};

export default SummaryFields;
