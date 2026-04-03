"use client";

import type React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import ViewModeToggle from "@/components/history/view-mode-toggle";
import WorkoutCalendar from "@/components/history/workout-calendar";
import WorkoutDayCard from "@/components/history/workout-day-card";
import EmptyState from "@/components/history/empty-state";

interface LogEntry {
  id: number;
  exerciseName: string;
  performedAt: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  unit: string | null;
  durationMinutes: number | null;
  notes: string | null;
}

interface HistoryPageClientProps {
  logDates: string[];
  logs: LogEntry[];
}

type ViewMode = "calendar" | "list";

const HistoryPageClient: React.FC<HistoryPageClientProps> = ({
  logDates,
  logs,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const logDatesSet = useMemo(() => new Set(logDates), [logDates]);

  const selectedDayLogs = useMemo(() => {
    if (!selectedDate) return [];
    return logs.filter((log) => log.performedAt === selectedDate);
  }, [logs, selectedDate]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    for (const log of logs) {
      const existing = map.get(log.performedAt);
      if (existing) {
        existing.push(log);
      } else {
        map.set(log.performedAt, [log]);
      }
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [logs]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">History</h1>
        <div className="flex items-center gap-2">
          <ViewModeToggle viewMode={viewMode} onChangeViewMode={setViewMode} />
          <Link
            href="/log"
            className={buttonVariants({ size: "icon", variant: "default" })}
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {viewMode === "calendar" && (
        <div className="flex flex-col gap-4">
          <WorkoutCalendar
            logDates={logDatesSet}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          {selectedDate ? (
            selectedDayLogs.length > 0 ? (
              <WorkoutDayCard date={selectedDate} logs={selectedDayLogs} />
            ) : (
              <EmptyState message="No workouts on this day." />
            )
          ) : (
            <EmptyState message="Select a date to view workouts." />
          )}
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex flex-col gap-4">
          {groupedByDate.length > 0 ? (
            groupedByDate.map(([date, dateLogs]) => (
              <WorkoutDayCard key={date} date={date} logs={dateLogs} />
            ))
          ) : (
            <EmptyState message="No workouts logged yet." />
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPageClient;
