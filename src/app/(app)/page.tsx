// src/app/(app)/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getWeeklyStats,
  getRecentLogs,
  getWorkoutStreak,
  getTodayPlan,
  getAllExercises,
  getAllCardioStretching,
} from "@/db/queries";
import WeeklyStats from "@/components/dashboard/weekly-stats";
import StreakBadge from "@/components/dashboard/streak-badge";
import TodayPlanCard from "@/components/dashboard/today-plan-card";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import type { RecentLogEntry } from "@/types/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

const DashboardPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const userName = session.user.name ?? "there";

  const [stats, streak, recentLogs, todayPlan, allExercises, allCardio] =
    await Promise.all([
      getWeeklyStats(userId),
      getWorkoutStreak(userId),
      getRecentLogs(userId, 6),
      getTodayPlan(userId),
      getAllExercises(),
      getAllCardioStretching(),
    ]);

  const nameMap = new Map<string, string>();
  for (const e of allExercises) {
    nameMap.set(`exercise:${e.id}`, e.name);
  }
  for (const c of allCardio) {
    nameMap.set(`cardio_stretching:${c.id}`, c.name);
  }

  const recentWithNames: RecentLogEntry[] = recentLogs.map((log) => ({
    id: log.id,
    exerciseName:
      nameMap.get(`${log.exerciseSource}:${log.exerciseId}`) ??
      "Unknown Exercise",
    performedAt: log.performedAt,
    sets: log.sets,
    reps: log.reps,
    weight: log.weight,
    unit: log.unit,
    durationMinutes: log.durationMinutes,
  }));

  const planSummary = todayPlan
    ? {
        title: todayPlan.title,
        totalExercises: todayPlan.exercises.length,
        completedExercises: todayPlan.exercises.filter((e) => e.completed)
          .length,
      }
    : null;

  const hour = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  ).getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5 p-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold">
            {greeting}, {userName}
          </h1>
          <p className="text-muted-foreground text-sm">
            {new Date(
              new Date().toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
              }),
            ).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      <QuickActions />

      <div>
        <h2 className="text-muted-foreground mb-2 text-sm font-semibold uppercase tracking-wider">
          {"Today's Plan"}
        </h2>
        <TodayPlanCard plan={planSummary} />
      </div>

      <div>
        <h2 className="text-muted-foreground mb-2 text-sm font-semibold uppercase tracking-wider">
          This Week
        </h2>
        <WeeklyStats stats={stats} />
      </div>

      <RecentActivity logs={recentWithNames} />
    </div>
  );
};

export default DashboardPage;
