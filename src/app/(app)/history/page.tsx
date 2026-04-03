// src/app/(app)/history/page.tsx
import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getDistinctLogDates,
  getWorkoutLogsWithExerciseName,
} from "@/db/queries";
import HistoryPageClient from "@/components/history/history-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History",
};

const HistoryPage: React.FC = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [dates, logs] = await Promise.all([
    getDistinctLogDates(userId),
    getWorkoutLogsWithExerciseName(userId),
  ]);

  const logDates = dates as string[];

  const mappedLogs = logs.map((log) => ({
    id: log.id,
    exerciseName: log.exerciseName ?? "Unknown Exercise",
    performedAt: log.performedAt,
    sets: log.sets,
    reps: log.reps,
    weight: log.weight,
    unit: log.unit,
    durationMinutes: log.durationMinutes,
    notes: log.notes,
  }));

  return <HistoryPageClient logDates={logDates} logs={mappedLogs} />;
};

export default HistoryPage;
