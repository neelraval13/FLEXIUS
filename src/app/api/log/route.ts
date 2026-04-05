// src/app/api/log/route.ts
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";

interface LogPayload {
  exerciseId: number;
  exerciseSource: "exercise" | "cardio_stretching";
  performedAt: string;
  sets: number;
  reps: number;
  weight: number | null;
  unit: "kg" | "lbs" | null;
  durationMinutes: number | null;
  notes: string | null;
}

export const POST = async (req: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { logs: LogPayload[] };

    if (!body.logs?.length) {
      return Response.json({ error: "No logs provided" }, { status: 400 });
    }

    const userId = session.user.id;
    let synced = 0;

    for (const log of body.logs) {
      await db.insert(workoutLogs).values({
        userId,
        exerciseId: log.exerciseId,
        exerciseSource: log.exerciseSource,
        performedAt: log.performedAt,
        sets: log.sets,
        reps: log.reps,
        weight: log.weight,
        unit: log.unit,
        durationMinutes: log.durationMinutes,
        notes: log.notes ? `${log.notes} (synced offline)` : "(synced offline)",
      });
      synced++;
    }

    revalidatePath("/history");
    revalidatePath("/workout/today");
    revalidatePath("/");

    return Response.json({ success: true, synced });
  } catch (error) {
    console.error("Log sync error:", error);
    return Response.json({ error: "Failed to sync logs" }, { status: 500 });
  }
};
