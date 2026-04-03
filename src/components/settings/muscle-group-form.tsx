"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMuscleGroup } from "@/app/actions";

interface MuscleGroupFormProps {
  existingMajorGroups: string[];
  onClose: () => void;
  initialMajorGroup?: string;
  initialTargetMuscle?: string;
}

const MuscleGroupForm: React.FC<MuscleGroupFormProps> = ({
  existingMajorGroups,
  onClose,
  initialMajorGroup = "",
  initialTargetMuscle = "",
}) => {
  const [majorGroup, setMajorGroup] = useState(initialMajorGroup);
  const [customMajorGroup, setCustomMajorGroup] = useState("");
  const [targetMuscle, setTargetMuscle] = useState(initialTargetMuscle);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isCustom = majorGroup === "__custom__";
  const resolvedMajorGroup = isCustom ? customMajorGroup.trim() : majorGroup;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTarget = targetMuscle.trim();

    if (!resolvedMajorGroup) {
      setError("Major group is required");
      return;
    }
    if (!trimmedTarget) {
      setError("Target muscle is required");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await createMuscleGroup({
          majorGroup: resolvedMajorGroup,
          targetMuscle: trimmedTarget,
        });
        onClose();
      } catch {
        setError("Failed to add muscle group");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border bg-muted/50 p-3"
    >
      <div className="space-y-1.5">
        <Label htmlFor="major-group" className="text-xs">
          Major Group
        </Label>
        <select
          id="major-group"
          value={majorGroup}
          onChange={(e) => setMajorGroup(e.target.value)}
          disabled={isPending}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Select major group...</option>
          {existingMajorGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          <option value="__custom__">+ New group...</option>
        </select>
        {isCustom && (
          <Input
            value={customMajorGroup}
            onChange={(e) => setCustomMajorGroup(e.target.value)}
            placeholder="New major group name"
            autoFocus
            disabled={isPending}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="target-muscle" className="text-xs">
          Target Muscle
        </Label>
        <Input
          id="target-muscle"
          value={targetMuscle}
          onChange={(e) => setTargetMuscle(e.target.value)}
          placeholder="e.g., Upper Chest"
          disabled={isPending}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !resolvedMajorGroup || !targetMuscle.trim()}
        >
          {isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default MuscleGroupForm;
