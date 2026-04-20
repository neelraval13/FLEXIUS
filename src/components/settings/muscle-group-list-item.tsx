"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { MuscleGroupItem } from "@/types/settings";
import { updateMuscleGroup, deleteMuscleGroup } from "@/app/actions";
import DeleteConfirmButton from "@/components/settings/delete-confirm-button";

interface MuscleGroupListItemProps {
  item: MuscleGroupItem;
  existingMajorGroups: string[];
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
}

const MuscleGroupListItem: React.FC<MuscleGroupListItemProps> = ({
  item,
  existingMajorGroups,
  isEditing,
  onEdit,
  onCancelEdit,
}) => {
  const [majorGroup, setMajorGroup] = useState(item.majorGroup);
  const [customMajorGroup, setCustomMajorGroup] = useState("");
  const [targetMuscle, setTargetMuscle] = useState(item.targetMuscle);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isCustom = majorGroup === "__custom__";
  const resolvedMajorGroup = isCustom ? customMajorGroup.trim() : majorGroup;

  const handleSave = (e: React.FormEvent) => {
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
        await updateMuscleGroup(item.id, {
          majorGroup: resolvedMajorGroup,
          targetMuscle: trimmedTarget,
        });
        onCancelEdit();
      } catch {
        setError("Failed to update");
      }
    });
  };

  const handleDelete = async () => {
    await deleteMuscleGroup(item.id);
  };

  const handleCancel = () => {
    setMajorGroup(item.majorGroup);
    setCustomMajorGroup("");
    setTargetMuscle(item.targetMuscle);
    setError("");
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="space-y-3 rounded-lg border border-primary/30 bg-muted/50 p-3"
      >
        <div className="space-y-1.5">
          <Label className="text-xs">Major Group</Label>
          <Select
            value={majorGroup}
            onValueChange={(v) => {
              if (v !== null) setMajorGroup(v);
            }}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {existingMajorGroups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem value="__custom__">+ New group...</SelectItem>
            </SelectContent>
          </Select>
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
          <Label className="text-xs">Target Muscle</Label>
          <Input
            value={targetMuscle}
            onChange={(e) => setTargetMuscle(e.target.value)}
            placeholder="e.g., Upper Chest"
            disabled={isPending}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !resolvedMajorGroup || !targetMuscle.trim()}
          >
            {isPending ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : null}
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
      <span className="flex-1 text-sm">{item.targetMuscle}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={onEdit}
        aria-label="Edit muscle group"
      >
        <Pencil className="size-3.5" />
      </Button>
      <DeleteConfirmButton onDelete={handleDelete} />
    </div>
  );
};

export default MuscleGroupListItem;
