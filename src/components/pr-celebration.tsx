// src/components/pr-celebration.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Trophy, X } from "lucide-react";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true));

    // Haptic celebration
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  const formatValue = (val: number) => {
    if (type === "duration") return `${val} min`;
    return `${val} ${unit}`;
  };

  return (
    <div
      className={`fixed inset-0 z-200 flex items-center justify-center transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Card */}
      <div
        className={`relative mx-4 w-full max-w-sm rounded-2xl border border-amber-500/30 bg-card p-6 shadow-2xl transition-all duration-500 ${
          visible ? "scale-100 translate-y-0" : "scale-90 translate-y-8"
        }`}
      >
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          {/* Trophy */}
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold">New PR!</h2>
          <p className="mt-1 text-sm text-muted-foreground">{exerciseName}</p>

          {/* PR Value */}
          <div className="mt-4 rounded-xl bg-amber-500/5 p-4">
            <div className="text-3xl font-bold text-amber-500">
              {formatValue(current)}
            </div>
            {previous != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                Previous best: {formatValue(previous)}
                <span className="ml-1.5 text-emerald-500">
                  (+{formatValue(current - previous).replace(` ${unit}`, "")}
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

          {/* Confetti emoji row */}
          <div className="mt-4 text-2xl">🎉🏆💪</div>
        </div>
      </div>
    </div>
  );
};

export default PRCelebration;
