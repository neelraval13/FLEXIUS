// src/app/actions/auth-actions.ts

"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function registerAction(data: {
  username: string;
  password: string;
  name: string;
}) {
  const { username, password, name } = data;

  if (!username || !password || !name) {
    return { success: false, error: "All fields are required" };
  }

  if (username.length < 3 || username.length > 30) {
    return { success: false, error: "Username must be 3–30 characters" };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters",
    };
  }

  // Check if username is taken
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  if (existing) {
    return { success: false, error: "Username already taken" };
  }

  const id = nanoid();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  // Create user
  await db.insert(users).values({
    id,
    username: username.toLowerCase(),
    passwordHash,
    name: name.trim(),
    createdAt: now,
  });

  // Auto-create profile
  await db.insert(userProfiles).values({
    id,
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  });

  return { success: true };
}
