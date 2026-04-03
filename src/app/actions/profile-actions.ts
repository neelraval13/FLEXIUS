// src/app/actions/profile-actions.ts

"use server";

import { auth } from "@/lib/auth";
import { upsertProfile, toggleFavorite } from "@/db/queries/profile";
import { revalidatePath } from "next/cache";
import type { UpdateProfileInput } from "@/types/profile";

export async function updateProfileAction(data: UpdateProfileInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const profile = await upsertProfile(session.user.id, data);
    revalidatePath("/profile");
    revalidatePath("/"); // dashboard greeting uses name
    return { success: true, profile };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function toggleFavoriteAction(
  exerciseId: number,
  source: "exercise" | "cardio_stretching",
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const isFav = await toggleFavorite(session.user.id, exerciseId, source);
    revalidatePath("/profile");
    revalidatePath("/exercises");
    return { success: true, isFavorite: isFav };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to toggle favorite",
    };
  }
}
