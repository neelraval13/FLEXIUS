// src/components/pr-celebration.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Trophy } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PRCelebrationProps {
  type: "weight" | "reps" | "duration";
  exerciseName: string;
  previous: number | null;
  current: number;
  unit?: string;
  onDismiss: () => void;
}

const PRCelebration: React.FC<PRCelebrationProps> = ({
  type,
  exerciseName,
  previous,
  current,
  unit = "kg",
  onDismiss,
}) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Haptic celebration
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      setOpen(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) {
        // give dialog animation time before notifying parent
        setTimeout(onDismiss, 150);
      }
    },
    [onDismiss],
  );

  const formatValue = (val: number) => {
    if (type === "duration") return `${val} min`;
    return `${val} ${unit}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl border-0 ring-2 ring-accent/30 sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Trophy className="h-8 w-8 text-accent-foreground" />
          </div>
          <DialogTitle className="text-xl font-bold">New PR!</DialogTitle>
          <DialogDescription>{exerciseName}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-accent/5 p-4 text-center">
          <div className="text-3xl font-bold text-accent-foreground">
            {formatValue(current)}
          </div>
          {previous != null && (
            <p className="mt-1 text-sm text-muted-foreground">
              Previous best: {formatValue(previous)}
              <span className="ml-1.5 text-emerald-500">
                (+
                {formatValue(current - previous).replace(` ${unit}`, "")}
                {type !== "duration" ? ` ${unit}` : " min"})
              </span>
            </p>
          )}
          {previous == null && (
            <p className="mt-1 text-sm text-muted-foreground">
              First time logging this exercise!
            </p>
          )}
        </div>

        <div className="text-center text-2xl">🎉🏆💪</div>
      </DialogContent>
    </Dialog>
  );
};

export default PRCelebration;
