// src/app/api/push/weekly-report/route.ts
// Called by Vercel Cron every Sunday at 8:00 PM IST (14:30 UTC)

import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { sendPushToUser, type PushPayload } from "@/lib/push";
import { generateWeeklyReport } from "@/lib/weekly-report";

const CRON_SECRET = process.env.CRON_SECRET;

const formatVolume = (vol: number): string => {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
  return `${vol}`;
};

export const GET = async (req: Request): Promise<Response> => {
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subs = await db
      .selectDistinct({ userId: pushSubscriptions.userId })
      .from(pushSubscriptions);

    let notified = 0;

    for (const { userId } of subs) {
      const report = await generateWeeklyReport(userId);

      // Don't notify if they didn't work out at all
      if (report.workoutDays === 0) continue;

      // Build notification body
      const lines: string[] = [];
      lines.push(
        `${report.workoutDays} days · ${report.totalExercises} exercises · ${formatVolume(report.totalVolume)} kg volume`,
      );

      if (report.muscleGroupsHit.length > 0) {
        lines.push(`Muscles hit: ${report.muscleGroupsHit.join(", ")}`);
      }

      if (
        report.muscleGroupsMissed.length > 0 &&
        report.muscleGroupsMissed.length <= 3
      ) {
        lines.push(`Missed: ${report.muscleGroupsMissed.join(", ")}`);
      }

      if (report.prs.length > 0) {
        lines.push(
          `🏆 ${report.prs.length} PR${report.prs.length > 1 ? "s" : ""} this week!`,
        );
      }

      if (report.streak > 0) {
        lines.push(`🔥 ${report.streak}-day streak`);
      }

      // Week-over-week comparison
      if (report.prevWeek) {
        const volDiff = report.totalVolume - report.prevWeek.totalVolume;
        if (volDiff > 0) {
          lines.push(`📈 +${formatVolume(volDiff)} kg vs last week`);
        } else if (volDiff < 0) {
          lines.push(`📉 ${formatVolume(volDiff)} kg vs last week`);
        }
      }

      const payload: PushPayload = {
        title: `📊 Weekly Report — ${report.userName}`,
        body: lines.join("\n"),
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        url: "/report/weekly",
        tag: "weekly-report",
      };

      await sendPushToUser(userId, payload);
      notified++;
    }

    return Response.json({ success: true, notified });
  } catch (error) {
    console.error("Weekly report cron error:", error);
    return Response.json({ error: "Weekly report failed" }, { status: 500 });
  }
};
