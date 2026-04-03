// src/components/log/exercise-selector.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown, Dumbbell, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SelectableExercise } from "@/types/logs";

interface ExerciseSelectorProps {
  exercises: SelectableExercise[];
  cardioExercises: SelectableExercise[];
  selected: SelectableExercise | null;
  onSelect: (exercise: SelectableExercise) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  cardioExercises,
  selected,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (exercise: SelectableExercise) => {
    onSelect(exercise);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        role="combobox"
        aria-expanded={open}
      >
        {selected ? (
          <span className="flex items-center gap-2 truncate">
            {selected.source === "exercise" ? (
              <Dumbbell className="h-4 w-4 shrink-0" />
            ) : (
              <Heart className="h-4 w-4 shrink-0" />
            )}
            {selected.name}
          </span>
        ) : (
          <span className="text-muted-foreground">Select exercise...</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search exercises..." />
          <CommandList>
            <CommandEmpty>No exercise found.</CommandEmpty>
            <CommandGroup heading="Exercises">
              {exercises.map((exercise) => (
                <CommandItem
                  key={`exercise-${exercise.id}`}
                  value={`${exercise.name} ${exercise.targetMuscle}`}
                  onSelect={() => handleSelect(exercise)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected?.id === exercise.id &&
                        selected?.source === "exercise"
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{exercise.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {exercise.targetMuscle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Cardio & More">
              {cardioExercises.map((exercise) => (
                <CommandItem
                  key={`cardio-${exercise.id}`}
                  value={`${exercise.name} ${exercise.targetMuscle} ${exercise.category}`}
                  onSelect={() => handleSelect(exercise)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected?.id === exercise.id &&
                        selected?.source === "cardio_stretching"
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{exercise.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {exercise.category} · {exercise.targetMuscle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ExerciseSelector;
