// src/app/api/push/remind/route.ts
// Called by Vercel Cron daily at 6:00 PM IST (12:30 UTC)

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, pushSubscriptions, workoutPlans } from "@/db/schema";
import { getWorkoutStreak } from "@/db/queries/dashboard";
import { sendPushToUser, type PushPayload } from "@/lib/push";

const CRON_SECRET = process.env.CRON_SECRET;

export const GET = async (req: Request): Promise<Response> => {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users who have push subscriptions
    const subs = await db
      .selectDistinct({ userId: pushSubscriptions.userId })
      .from(pushSubscriptions);

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Calcutta",
    });

    let notified = 0;

    for (const { userId } of subs) {
      const streak = await getWorkoutStreak(userId);

      // Check if user has a plan for today
      const todayPlan = await db
        .select({ id: workoutPlans.id, title: workoutPlans.title })
        .from(workoutPlans)
        .where(eq(workoutPlans.date, today))
        .limit(1);

      // Get user's name
      const [user] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const name = user?.name ?? "there";
      let payload: PushPayload | null = null;

      if (streak > 0) {
        // User has an active streak — remind them to keep it going
        payload = {
          title: `🔥 ${streak}-day streak!`,
          body: `Don't break it, ${name}. Log today's workout to keep it alive.`,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          url: todayPlan[0] ? "/workout/today" : "/chat",
          tag: "streak-reminder",
        };
      } else if (todayPlan[0]) {
        // No streak but has a plan
        payload = {
          title: "💪 Workout plan ready",
          body: `${todayPlan[0].title ?? "Your plan"} is waiting. Let's go, ${name}.`,
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          url: "/workout/today",
          tag: "plan-reminder",
        };
      }
      // No streak and no plan = rest day, don't bother them

      if (payload) {
        await sendPushToUser(userId, payload);
        notified++;
      }
    }

    return Response.json({ success: true, notified });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return Response.json({ error: "Reminder failed" }, { status: 500 });
  }
};
