// src/app/api/push/subscribe/route.ts
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export const POST = async (req: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subscription } = (await req.json()) as {
      subscription: {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
    };

    if (!subscription?.endpoint || !subscription?.keys) {
      return Response.json({ error: "Invalid subscription" }, { status: 400 });
    }

    // Upsert — delete old subscription with same endpoint, insert new
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint));

    await db.insert(pushSubscriptions).values({
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return Response.json(
      { error: "Failed to save subscription" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { endpoint } = (await req.json()) as { endpoint: string };

    if (!endpoint) {
      return Response.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return Response.json(
      { error: "Failed to remove subscription" },
      { status: 500 },
    );
  }
};
