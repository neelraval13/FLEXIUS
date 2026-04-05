// src/components/report/weekly-report-view.tsx
"use client";

import type React from "react";
import Link from "next/link";
import {
  Calendar,
  Dumbbell,
  Flame,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Target,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklyReport } from "@/lib/weekly-report";

interface WeeklyReportViewProps {
  report: WeeklyReport;
}

const formatVolume = (vol: number): string => {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
  return `${vol}`;
};

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${s.toLocaleDateString("en-IN", opts)} — ${e.toLocaleDateString("en-IN", opts)}`;
};

const TrendBadge: React.FC<{
  current: number;
  previous: number;
  unit?: string;
}> = ({ current, previous, unit = "" }) => {
  const diff = current - previous;
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-500">
        <TrendingUp className="h-3 w-3" />+{pct}%
        {unit && ` (${formatVolume(Math.abs(diff))} ${unit})`}
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-red-400">
        <TrendingDown className="h-3 w-3" />
        {pct}%{unit && ` (${formatVolume(Math.abs(diff))} ${unit})`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" />
      Same as last week
    </span>
  );
};

const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ report }) => {
  const hasData = report.workoutDays > 0;

  return (
    <div className="space-y-4 p-4 pb-8">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <h1 className="text-xl font-bold">Weekly Report</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(report.weekStart, report.weekEnd)}
        </p>
      </div>

      {!hasData ? (
        <Card className="border-muted">
          <CardContent className="py-12 text-center">
            <Dumbbell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">No workouts this week</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a workout to see your weekly stats here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Workout Days</p>
                  <p className="text-lg font-bold">{report.workoutDays}</p>
                  {report.prevWeek && (
                    <TrendBadge
                      current={report.workoutDays}
                      previous={report.prevWeek.workoutDays}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Exercises</p>
                  <p className="text-lg font-bold">{report.totalExercises}</p>
                  {report.prevWeek && (
                    <TrendBadge
                      current={report.totalExercises}
                      previous={report.prevWeek.totalExercises}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="text-lg font-bold">
                    {formatVolume(report.totalVolume)} kg
                  </p>
                  {report.prevWeek && (
                    <TrendBadge
                      current={report.totalVolume}
                      previous={report.prevWeek.totalVolume}
                      unit="kg"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Flame className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-lg font-bold">
                    {report.streak} day{report.streak !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Muscle coverage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Muscle Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {report.muscleGroupsHit.map((group) => (
                  <span
                    key={group}
                    className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500"
                  >
                    ✓ {group}
                  </span>
                ))}
                {report.muscleGroupsMissed.map((group) => (
                  <span
                    key={group}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {group}
                  </span>
                ))}
              </div>
              {report.muscleGroupsMissed.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/5 p-3">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p className="text-xs text-muted-foreground">
                    Consider adding{" "}
                    <span className="font-medium text-foreground">
                      {report.muscleGroupsMissed.join(", ")}
                    </span>{" "}
                    exercises next week for balanced training.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRs */}
          {report.prs.length > 0 && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  PRs This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.prs.map((pr, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2"
                    >
                      <span className="text-sm font-medium">
                        {pr.exerciseName}
                      </span>
                      <span className="text-sm font-bold text-amber-500">
                        {pr.weight} {pr.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Total sets */}
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Total Sets</p>
              <p className="text-3xl font-bold">{report.totalSets}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default WeeklyReportView;
