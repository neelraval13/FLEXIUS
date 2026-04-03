"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { History, Dumbbell, Timer } from "lucide-react";
import type { RecentLogEntry } from "@/types/dashboard";

interface RecentActivityProps {
  logs: RecentLogEntry[];
}

const formatDetail = (log: RecentLogEntry): string => {
  const parts: string[] = [];
  if (log.sets && log.reps) {
    parts.push(`${log.sets}×${log.reps}`);
  }
  if (log.weight) {
    parts.push(`${log.weight} ${log.unit || "kg"}`);
  }
  if (log.durationMinutes) {
    parts.push(`${log.durationMinutes} min`);
  }
  return parts.join(" · ") || "Logged";
};

const formatDate = (dateStr: string): string => {
  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const RecentActivity: React.FC<RecentActivityProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <History className="text-muted-foreground h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            No workouts logged yet
          </p>
          <Link
            href="/log"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Log your first workout
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Recent Activity
        </CardTitle>
        <Link
          href="/history"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-3 text-sm">
            <div className="bg-muted rounded-lg p-2">
              {log.durationMinutes && !log.weight ? (
                <Timer className="h-4 w-4 text-emerald-500" />
              ) : (
                <Dumbbell className="text-primary h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{log.exerciseName}</p>
              <p className="text-muted-foreground text-xs">
                {formatDetail(log)}
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 text-xs">
              {formatDate(log.performedAt)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
