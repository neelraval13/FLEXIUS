// src/components/exercises/pr-card.tsx
"use client";

import type React from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutLogEntry } from "@/components/exercises/history-chart";

interface PRCardProps {
  logs: WorkoutLogEntry[];
  isCardio: boolean;
}

const PRCard: React.FC<PRCardProps> = ({ logs, isCardio }) => {
  if (logs.length === 0) return null;

  if (isCardio) {
    const maxDuration = Math.max(
      ...logs.map((l) => l.durationMinutes ?? 0).filter((d) => d > 0),
    );
    if (maxDuration <= 0) return null;

    const prLog = logs.find((l) => l.durationMinutes === maxDuration);

    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            Personal Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-500">
              {maxDuration} min
            </span>
            <span className="text-sm text-muted-foreground">
              longest session
            </span>
          </div>
          {prLog && (
            <p className="mt-1 text-xs text-muted-foreground">
              Set on{" "}
              {new Date(prLog.performedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Strength exercise — show max weight and max volume (weight × reps)
  const logsWithWeight = logs.filter((l) => l.weight != null && l.weight > 0);
  if (logsWithWeight.length === 0) return null;

  const maxWeight = Math.max(...logsWithWeight.map((l) => l.weight!));
  const weightPRLog = logsWithWeight.find((l) => l.weight === maxWeight);

  const maxVolume = Math.max(
    ...logsWithWeight.map((l) => (l.weight ?? 0) * (l.reps ?? 1)),
  );
  const volumePRLog = logsWithWeight.reduce(
    (best, l) => {
      const vol = (l.weight ?? 0) * (l.reps ?? 1);
      return vol > (best.vol ?? 0) ? { log: l, vol } : best;
    },
    { log: logsWithWeight[0], vol: 0 },
  );

  const unit = weightPRLog?.unit ?? "kg";

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-500" />
          Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Weight PR */}
          <div>
            <p className="text-xs text-muted-foreground">Max Weight</p>
            <p className="text-xl font-bold text-amber-500">
              {maxWeight} {unit}
            </p>
            {weightPRLog && (
              <p className="text-[11px] text-muted-foreground">
                {new Date(weightPRLog.performedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                {weightPRLog.reps ? ` · ${weightPRLog.reps} reps` : ""}
              </p>
            )}
          </div>

          {/* Volume PR */}
          <div>
            <p className="text-xs text-muted-foreground">Max Volume</p>
            <p className="text-xl font-bold text-amber-500">
              {maxVolume} {unit}
            </p>
            {volumePRLog.log && (
              <p className="text-[11px] text-muted-foreground">
                {new Date(volumePRLog.log.performedAt).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short" },
                )}
                {volumePRLog.log.weight && volumePRLog.log.reps
                  ? ` · ${volumePRLog.log.weight}${unit} × ${volumePRLog.log.reps}`
                  : ""}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PRCard;
