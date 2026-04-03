"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkoutLogItem from "@/components/history/workout-log-item";
import DeleteLogButton from "@/components/history/delete-log-button";

interface LogEntry {
  id: number;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  unit: string | null;
  durationMinutes: number | null;
  notes: string | null;
}

interface WorkoutDayCardProps {
  date: string;
  logs: LogEntry[];
}

const formatDisplayDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const WorkoutDayCard: React.FC<WorkoutDayCardProps> = ({ date, logs }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          {formatDisplayDate(date)}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {logs.length} {logs.length === 1 ? "exercise" : "exercises"}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2">
            <div className="flex-1">
              <WorkoutLogItem
                id={log.id}
                exerciseName={log.exerciseName}
                sets={log.sets}
                reps={log.reps}
                weight={log.weight}
                unit={log.unit}
                durationMinutes={log.durationMinutes}
                notes={log.notes}
              />
            </div>
            <div className="pt-2.5">
              <DeleteLogButton logId={log.id} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WorkoutDayCard;
