// src/lib/auth.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt with a random per-hash salt.
 * Used for new registrations and for migrating legacy hashes.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Legacy SHA-256 hash (unsalted) — kept only for verifying existing
 * passwords that were stored before the bcrypt migration.
 * DO NOT use for new hashes.
 */
async function legacySha256Hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

/**
 * Detect whether a stored hash is a legacy SHA-256 hex string
 * (exactly 64 hex chars) vs. a bcrypt hash ($2a$ or $2b$ prefix).
 */
function isLegacyHash(storedHash: string): boolean {
  return /^[0-9a-f]{64}$/.test(storedHash);
}

/**
 * Verify a password against a stored hash. Handles both:
 *  - bcrypt hashes (new) — verified via bcrypt.compare
 *  - SHA-256 hex hashes (legacy) — verified via constant-time comparison
 *
 * Returns true if the password matches.
 */
async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (isLegacyHash(storedHash)) {
    const legacyHash = await legacySha256Hash(password);
    // Constant-time comparison to prevent timing attacks
    if (legacyHash.length !== storedHash.length) return false;
    let mismatch = 0;
    for (let i = 0; i < legacyHash.length; i++) {
      mismatch |= legacyHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return mismatch === 0;
  }

  return bcrypt.compare(password, storedHash);
}

/**
 * After a successful login with a legacy SHA-256 hash,
 * silently upgrade it to bcrypt so the user is migrated
 * transparently — no action needed on their end.
 */
async function upgradeLegacyHash(
  userId: string,
  plainPassword: string,
): Promise<void> {
  try {
    const bcryptHash = await hashPassword(plainPassword);
    await db
      .update(users)
      .set({ passwordHash: bcryptHash })
      .where(eq(users.id, userId));
  } catch (error) {
    // Non-fatal — user is already authenticated, the upgrade
    // will be retried on their next login.
    console.error("Failed to upgrade legacy password hash:", error);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;
        if (!username || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username.toLowerCase()))
          .limit(1);

        if (!user) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        // Transparently migrate legacy SHA-256 → bcrypt on successful login
        if (isLegacyHash(user.passwordHash)) {
          await upgradeLegacyHash(user.id, password);
        }

        return { id: user.id, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
