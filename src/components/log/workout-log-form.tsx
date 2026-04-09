"use client";

import type React from "react";
import { useState, useTransition, useCallback } from "react";
import { Loader2, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createWorkoutLog, createBatchWorkoutLogs } from "@/app/actions";
import { queueLog } from "@/lib/offline-queue";
import type { SelectableExercise, SetEntry, ExerciseType } from "@/types/logs";
import { getExerciseType } from "@/types/logs";
import ExerciseSelector from "@/components/log/exercise-selector";
import LogModeToggle from "@/components/log/log-mode-toggle";
import SummaryFields from "@/components/log/summary-fields";
import PerSetFields from "@/components/log/per-set-fields";
import DateNotesFields from "@/components/log/date-notes-fields";
import SuccessMessage from "@/components/log/success-message";
import PRCelebration from "@/components/pr-celebration";

interface WorkoutLogFormProps {
  exercises: SelectableExercise[];
  cardioExercises: SelectableExercise[];
  preselectedExercise?: SelectableExercise | null;
  returnTo?: string;
}

const getDefaultSetEntry = (): SetEntry => ({
  id: crypto.randomUUID(),
  reps: 12,
  weight: 0,
});

const WorkoutLogForm: React.FC<WorkoutLogFormProps> = ({
  exercises,
  cardioExercises,
  preselectedExercise = null,
  returnTo,
}) => {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const [prData, setPrData] = useState<{
    type: "weight" | "reps" | "duration";
    exerciseName: string;
    previous: number | null;
    current: number;
    unit: string;
  } | null>(null);

  // Exercise selection
  const [selectedExercise, setSelectedExercise] =
    useState<SelectableExercise | null>(preselectedExercise);

  // Mode
  const [mode, setMode] = useState<"summary" | "per-set">("summary");

  // Shared fields
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Summary fields
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(12);
  const [weight, setWeight] = useState<number | "">(0);
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [duration, setDuration] = useState<number | "">(30);

  // Per-set fields
  const [setEntries, setSetEntries] = useState<SetEntry[]>([
    getDefaultSetEntry(),
  ]);

  const exerciseType: ExerciseType | null = selectedExercise
    ? getExerciseType(selectedExercise)
    : null;

  const showPerSetOption =
    exerciseType === "strength" || exerciseType === "core";

  const handleExerciseSelect = useCallback((exercise: SelectableExercise) => {
    setSelectedExercise(exercise);
    setSuccess(null);
    setMode("summary");

    const type = getExerciseType(exercise);
    if (type === "strength") {
      setSets(3);
      setReps(12);
      setWeight(0);
      setDuration("");
    } else if (type === "core") {
      setSets(3);
      setReps(15);
      setWeight("");
      setDuration("");
    } else {
      setSets(0);
      setReps(0);
      setWeight("");
      setDuration(30);
    }
    setSetEntries([getDefaultSetEntry()]);
  }, []);

  const handleSetEntryChange = useCallback(
    (id: string, field: "reps" | "weight", value: number) => {
      setSetEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      );
    },
    [],
  );

  const handleAddSetEntry = useCallback(() => {
    setSetEntries((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          reps: last?.reps ?? 12,
          weight: last?.weight ?? 0,
        },
      ];
    });
  }, []);

  const handleRemoveSetEntry = useCallback((id: string) => {
    setSetEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const resetForm = useCallback(() => {
    setSelectedExercise(null);
    setMode("summary");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setSets(3);
    setReps(12);
    setWeight(0);
    setUnit("kg");
    setDuration(30);
    setSetEntries([getDefaultSetEntry()]);
    setSuccess(null);
    setQueued(false);
    setPrData(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    startTransition(async () => {
      try {
        // Check for PR BEFORE inserting (so the query isn't polluted)
        let detectedPR: typeof prData = null;
        try {
          const maxWeight =
            mode === "per-set" && showPerSetOption
              ? Math.max(...setEntries.map((e) => e.weight ?? 0))
              : typeof weight === "number"
                ? weight
                : null;
          const maxDuration = typeof duration === "number" ? duration : null;

          const prRes = await fetch("/api/pr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exerciseId: selectedExercise.id,
              source: selectedExercise.source,
              weight: maxWeight,
              reps:
                mode === "per-set"
                  ? Math.max(...setEntries.map((e) => e.reps))
                  : reps,
              durationMinutes: maxDuration,
            }),
          });

          if (prRes.ok) {
            const pr = await prRes.json();
            if (pr.isPR) {
              detectedPR = {
                type: pr.type,
                exerciseName: selectedExercise.name,
                previous: pr.previous,
                current: pr.current,
                unit: unit,
              };
            }
          }
        } catch {
          // PR check failed — not critical
        }

        // Now insert the log
        if (mode === "per-set" && showPerSetOption) {
          const inputs = setEntries.map((entry, index) => ({
            exerciseId: selectedExercise.id,
            exerciseSource: selectedExercise.source,
            performedAt: date,
            sets: 1,
            reps: entry.reps,
            weight:
              exerciseType === "strength" || exerciseType === "core"
                ? entry.weight || null
                : null,
            unit:
              exerciseType === "strength" || exerciseType === "core"
                ? unit
                : null,
            durationMinutes: null,
            notes:
              setEntries.length > 1
                ? `Set ${index + 1} of ${setEntries.length}${notes ? ` — ${notes}` : ""}`
                : notes || null,
          }));
          await createBatchWorkoutLogs(inputs);
        } else {
          const isStrengthLike =
            exerciseType === "strength" || exerciseType === "core";
          const isDurationBased =
            exerciseType === "cardio" || exerciseType === "stretching";

          await createWorkoutLog({
            exerciseId: selectedExercise.id,
            exerciseSource: selectedExercise.source,
            performedAt: date,
            sets: isStrengthLike ? sets : 0,
            reps: isStrengthLike ? reps : 0,
            weight: isStrengthLike && weight !== "" ? weight : null,
            unit: isStrengthLike ? unit : "kg",
            durationMinutes:
              isDurationBased && duration !== "" ? duration : null,
            notes: notes || null,
          });
        }

        setSuccess(selectedExercise.name);
        if (detectedPR) setPrData(detectedPR);
      } catch {
        // Offline or server error — queue for later sync
        try {
          if (mode === "per-set" && showPerSetOption) {
            for (const entry of setEntries) {
              await queueLog({
                exerciseId: selectedExercise.id,
                exerciseSource: selectedExercise.source,
                performedAt: date,
                sets: 1,
                reps: entry.reps,
                weight:
                  exerciseType === "strength" || exerciseType === "core"
                    ? entry.weight || null
                    : null,
                unit:
                  exerciseType === "strength" || exerciseType === "core"
                    ? unit
                    : null,
                durationMinutes: null,
                notes: notes || null,
              });
            }
          } else {
            const isStrengthLike =
              exerciseType === "strength" || exerciseType === "core";
            const isDurationBased =
              exerciseType === "cardio" || exerciseType === "stretching";

            await queueLog({
              exerciseId: selectedExercise.id,
              exerciseSource: selectedExercise.source,
              performedAt: date,
              sets: isStrengthLike ? sets : 0,
              reps: isStrengthLike ? reps : 0,
              weight: isStrengthLike && weight !== "" ? weight : null,
              unit: isStrengthLike ? unit : "kg",
              durationMinutes:
                isDurationBased && duration !== "" ? duration : null,
              notes: notes || null,
            });
          }

          setQueued(true);
          setSuccess(selectedExercise.name);
          window.dispatchEvent(new Event("workout-queued"));
        } catch (queueError) {
          console.error("Failed to queue workout:", queueError);
        }
      }
    });
  };

  if (success) {
    if (queued) {
      return (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6 text-center">
            <CloudOff className="mx-auto mb-3 h-12 w-12 text-amber-500" />
            <h3 className="text-lg font-semibold">Workout Queued</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {success} will be synced when you&apos;re back online.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={resetForm}>
              Log Another
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return (
      <>
        {prData && (
          <PRCelebration
            type={prData.type}
            exerciseName={prData.exerciseName}
            previous={prData.previous}
            current={prData.current}
            unit={prData.unit}
            onDismiss={() => setPrData(null)}
          />
        )}
        <SuccessMessage
          exerciseName={success}
          onLogAnother={resetForm}
          returnTo={returnTo}
        />
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Exercise Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseSelector
            exercises={exercises}
            cardioExercises={cardioExercises}
            selected={selectedExercise}
            onSelect={handleExerciseSelect}
          />
        </CardContent>
      </Card>

      {selectedExercise && exerciseType && (
        <>
          {/* Mode Toggle + Exercise Fields */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Details</CardTitle>
                {showPerSetOption && (
                  <LogModeToggle mode={mode} onModeChange={setMode} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {mode === "summary" ? (
                <SummaryFields
                  exerciseType={exerciseType}
                  sets={sets}
                  reps={reps}
                  weight={weight}
                  unit={unit}
                  duration={duration}
                  onSetsChange={setSets}
                  onRepsChange={setReps}
                  onWeightChange={setWeight}
                  onUnitChange={setUnit}
                  onDurationChange={setDuration}
                />
              ) : (
                <div className="space-y-4">
                  <PerSetFields
                    entries={setEntries}
                    showWeight={
                      exerciseType === "strength" || exerciseType === "core"
                    }
                    onChange={handleSetEntryChange}
                    onAdd={handleAddSetEntry}
                    onRemove={handleRemoveSetEntry}
                  />
                  {(exerciseType === "strength" || exerciseType === "core") && (
                    <div className="w-20">
                      <Label className="text-xs text-muted-foreground">
                        Unit
                      </Label>
                      <div className="flex gap-0.5 rounded-md bg-muted p-0.5">
                        <button
                          type="button"
                          className={`flex-1 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors ${
                            unit === "kg"
                              ? "bg-background shadow-sm"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setUnit("kg")}
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
                          onClick={() => setUnit("lbs")}
                        >
                          lbs
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date & Notes */}
          <Card>
            <CardContent className="pt-6">
              <DateNotesFields
                date={date}
                notes={notes}
                onDateChange={setDate}
                onNotesChange={setNotes}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging...
              </>
            ) : (
              "Log Workout"
            )}
          </Button>
        </>
      )}
    </form>
  );
};

export default WorkoutLogForm;
