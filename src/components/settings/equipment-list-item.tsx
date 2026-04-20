"use client";

import type React from "react";
import { useState, useMemo, useTransition } from "react";
import { Pencil, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type {
  ExerciseItem,
  MuscleGroupItem,
  EquipmentItem,
  Difficulty,
} from "@/types/settings";
import { DIFFICULTY_OPTIONS } from "@/types/settings";
import { updateExercise, deleteExercise } from "@/app/actions";
import DeleteConfirmButton from "@/components/settings/delete-confirm-button";
import DifficultyBadge from "@/components/exercises/difficulty-badge";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

const difficultyTint = (d: Difficulty, active: boolean): string => {
  if (!active) return "";
  switch (d) {
    case "Beginner":
      return "!bg-emerald-500/20 !text-emerald-600 dark:!text-emerald-400 ring-1 ring-emerald-500/40";
    case "Intermediate":
      return "!bg-amber-500/20 !text-amber-600 dark:!text-amber-400 ring-1 ring-amber-500/40";
    case "Advanced":
      return "!bg-destructive/15 !text-destructive ring-1 ring-destructive/30";
    default:
      return "";
  }
};

interface ExerciseListItemProps {
  item: ExerciseItem;
  muscleGroups: MuscleGroupItem[];
  equipment: EquipmentItem[];
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  item,
  muscleGroups,
  equipment,
  isEditing,
  onEdit,
  onCancelEdit,
}) => {
  const parsedEquipment = useMemo(
    () => parseJsonArray(item.equipmentUsed),
    [item.equipmentUsed],
  );
  const parsedAlternatives = useMemo(
    () => parseJsonArray(item.alternatives),
    [item.alternatives],
  );

  const [name, setName] = useState(item.name);
  const [muscleGroup, setMuscleGroup] = useState(item.muscleGroup);
  const [targetMuscle, setTargetMuscle] = useState(item.targetMuscle);
  const [selectedEquipment, setSelectedEquipment] =
    useState<string[]>(parsedEquipment);
  const [difficulty, setDifficulty] = useState(item.difficulty);
  const [alternatives, setAlternatives] = useState(
    parsedAlternatives.join(", "),
  );
  const [videoUrl, setVideoUrl] = useState(item.videoUrl ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const distinctMuscleGroups = useMemo(() => {
    const set = new Set(muscleGroups.map((mg) => mg.majorGroup));
    return Array.from(set).sort();
  }, [muscleGroups]);

  const targetMusclesForGroup = useMemo(() => {
    if (!muscleGroup) return [];
    return muscleGroups
      .filter((mg) => mg.majorGroup === muscleGroup)
      .map((mg) => mg.targetMuscle);
  }, [muscleGroups, muscleGroup]);

  const toggleEquipment = (eqName: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eqName)
        ? prev.filter((e) => e !== eqName)
        : [...prev, eqName],
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    if (!muscleGroup) {
      setError("Muscle group is required");
      return;
    }
    if (!targetMuscle) {
      setError("Target muscle is required");
      return;
    }

    setError("");

    const parsedAlts = alternatives
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        await updateExercise(item.id, {
          name: trimmedName,
          targetMuscle,
          muscleGroup,
          equipmentUsed: selectedEquipment,
          difficulty,
          alternatives: parsedAlts,
          videoUrl: videoUrl.trim() || null,
        });
        onCancelEdit();
      } catch {
        setError("Failed to update exercise");
      }
    });
  };

  const handleDelete = async () => {
    await deleteExercise(item.id);
  };

  const handleCancel = () => {
    setName(item.name);
    setMuscleGroup(item.muscleGroup);
    setTargetMuscle(item.targetMuscle);
    setSelectedEquipment(parsedEquipment);
    setDifficulty(item.difficulty);
    setAlternatives(parsedAlternatives.join(", "));
    setVideoUrl(item.videoUrl ?? "");
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
          <Label className="text-xs">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Muscle Group</Label>
            <Select
              value={muscleGroup}
              onValueChange={(val) => {
                setMuscleGroup(val ?? "");
                setTargetMuscle("");
              }}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {distinctMuscleGroups.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Target Muscle</Label>
            <Select
              value={targetMuscle}
              onValueChange={(v) => setTargetMuscle(v ?? "")}
              disabled={isPending || !muscleGroup}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {targetMusclesForGroup.map((tm) => (
                  <SelectItem key={tm} value={tm}>
                    {tm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Difficulty</Label>
          <ToggleGroup
            value={[difficulty]}
            onValueChange={(values) => {
              const next = values[0];
              if (next) setDifficulty(next);
            }}
            disabled={isPending}
          >
            {DIFFICULTY_OPTIONS.map((d: Difficulty) => (
              <ToggleGroupItem
                key={d}
                value={d}
                className={cn("px-3", difficultyTint(d, difficulty === d))}
              >
                {d}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">
            Equipment ({selectedEquipment.length} selected)
          </Label>
          {selectedEquipment.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedEquipment.map((eq) => (
                <Badge
                  key={eq}
                  variant="secondary"
                  className="cursor-pointer gap-1 text-xs"
                  onClick={() => toggleEquipment(eq)}
                >
                  {eq}
                  <X className="size-3" />
                </Badge>
              ))}
            </div>
          )}
          <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto rounded-md border p-2">
            {equipment.map((eq) => (
              <Badge
                key={eq.id}
                variant={
                  selectedEquipment.includes(eq.name) ? "default" : "outline"
                }
                className="cursor-pointer text-xs"
                onClick={() => toggleEquipment(eq.name)}
              >
                {eq.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Alternatives (comma-separated)</Label>
          <Input
            value={alternatives}
            onChange={(e) => setAlternatives(e.target.value)}
            placeholder="e.g., Push-ups, Dumbbell Press"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Video URL</Label>
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
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
            disabled={
              isPending || !name.trim() || !muscleGroup || !targetMuscle
            }
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
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium">{item.name}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {item.targetMuscle}
          </span>
          <DifficultyBadge difficulty={item.difficulty} />
          {parsedEquipment.length > 0 && (
            <span className="text-xs text-muted-foreground">
              · {parsedEquipment.length} equip.
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-foreground"
        onClick={onEdit}
        aria-label="Edit exercise"
      >
        <Pencil className="size-3.5" />
      </Button>
      <DeleteConfirmButton onDelete={handleDelete} />
    </div>
  );
};

export default ExerciseListItem;
