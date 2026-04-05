// src/components/workout/rest-timer-overlay.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { X, Plus, Minus, Minimize2, Maximize2 } from "lucide-react";
import { useRestTimer } from "./rest-timer-context";

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const RestTimerOverlay: React.FC = () => {
  const { timer, stopTimer, addTime } = useRestTimer();
  const [minimized, setMinimized] = useState(false);

  // Don't render if no timer
  if (!timer.isActive && timer.remainingSeconds === 0) return null;

  const progress =
    timer.totalSeconds > 0
      ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) *
        100
      : 100;

  const isFinished = timer.remainingSeconds === 0;

  // Circle math
  const SIZE = 120;
  const STROKE = 6;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className={`fixed bottom-20 left-4 z-80 flex h-12 items-center gap-2 rounded-full px-4 shadow-lg transition-all ${
          isFinished
            ? "animate-bounce bg-emerald-500 text-white"
            : "bg-card border border-border text-foreground"
        }`}
      >
        <span className="text-sm font-bold">
          {formatTime(timer.remainingSeconds)}
        </span>
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-80 -translate-x-1/2 rounded-2xl border p-4 shadow-2xl transition-all ${
        isFinished
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-border bg-card"
      }`}
    >
      {/* Top controls */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setMinimized(true)}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground">
          {timer.exerciseName}
        </span>
        <button
          onClick={stopTimer}
          className="rounded-lg p-1 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Circular timer */}
      <div className="relative mx-auto flex items-center justify-center">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={STROKE}
          />
          {/* Progress circle */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={isFinished ? "#10B981" : "hsl(var(--primary))"}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isFinished ? (
            <>
              <span className="text-2xl">💪</span>
              <span className="mt-0.5 text-xs font-semibold text-emerald-500">
                GO!
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold tabular-nums">
              {formatTime(timer.remainingSeconds)}
            </span>
          )}
        </div>
      </div>

      {/* Add/subtract time */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => addTime(-15)}
          disabled={timer.remainingSeconds < 15}
          className="flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <Minus className="h-3 w-3" />
          15s
        </button>
        <button
          onClick={() => addTime(15)}
          className="flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          15s
        </button>
        <button
          onClick={() => addTime(30)}
          className="flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          30s
        </button>
      </div>

      {/* Dismiss when finished */}
      {isFinished && (
        <button
          onClick={stopTimer}
          className="mt-3 w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-white"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

export default RestTimerOverlay;
