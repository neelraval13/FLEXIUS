"use client";

import type React from "react";
import { useState, useMemo, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type {
  MuscleGroupItem,
  EquipmentItem,
  Difficulty,
} from "@/types/settings";
import { DIFFICULTY_OPTIONS } from "@/types/settings";
import { createExercise } from "@/app/actions";

interface ExerciseFormProps {
  muscleGroups: MuscleGroupItem[];
  equipment: EquipmentItem[];
  onClose: () => void;
  initialValues?: {
    name: string;
    targetMuscle: string;
    muscleGroup: string;
    equipmentUsed: string[];
    difficulty: string;
    alternatives: string[];
    videoUrl: string;
  };
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  muscleGroups,
  equipment,
  onClose,
  initialValues,
}) => {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [muscleGroup, setMuscleGroup] = useState(
    initialValues?.muscleGroup ?? "",
  );
  const [targetMuscle, setTargetMuscle] = useState(
    initialValues?.targetMuscle ?? "",
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    initialValues?.equipmentUsed ?? [],
  );
  const [difficulty, setDifficulty] = useState<string>(
    initialValues?.difficulty ?? "Beginner",
  );
  const [alternatives, setAlternatives] = useState(
    initialValues?.alternatives?.join(", ") ?? "",
  );
  const [videoUrl, setVideoUrl] = useState(initialValues?.videoUrl ?? "");
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

  const handleSubmit = (e: React.FormEvent) => {
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

    const parsedAlternatives = alternatives
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        await createExercise({
          name: trimmedName,
          targetMuscle,
          muscleGroup,
          equipmentUsed: selectedEquipment,
          difficulty,
          alternatives: parsedAlternatives,
          videoUrl: videoUrl.trim() || null,
        });
        onClose();
      } catch {
        setError("Failed to add exercise");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border bg-muted/50 p-3"
    >
      <div className="space-y-1.5">
        <Label htmlFor="ex-name" className="text-xs">
          Name
        </Label>
        <Input
          id="ex-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name"
          autoFocus
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Muscle Group</Label>
          <select
            value={muscleGroup}
            onChange={(e) => {
              setMuscleGroup(e.target.value);
              setTargetMuscle("");
            }}
            disabled={isPending}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select...</option>
            {distinctMuscleGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Target Muscle</Label>
          <select
            value={targetMuscle}
            onChange={(e) => setTargetMuscle(e.target.value)}
            disabled={isPending || !muscleGroup}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select...</option>
            {targetMusclesForGroup.map((tm) => (
              <option key={tm} value={tm}>
                {tm}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Difficulty</Label>
        <div className="flex gap-1.5">
          {DIFFICULTY_OPTIONS.map((d: Difficulty) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              disabled={isPending}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                difficulty === d
                  ? d === "Beginner"
                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50"
                    : d === "Intermediate"
                      ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50"
                      : "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
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
        <Label htmlFor="ex-alternatives" className="text-xs">
          Alternatives (comma-separated)
        </Label>
        <Input
          id="ex-alternatives"
          value={alternatives}
          onChange={(e) => setAlternatives(e.target.value)}
          placeholder="e.g., Push-ups, Dumbbell Press"
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ex-video" className="text-xs">
          Video URL
        </Label>
        <Input
          id="ex-video"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          disabled={isPending}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !name.trim() || !muscleGroup || !targetMuscle}
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

export default ExerciseForm;
