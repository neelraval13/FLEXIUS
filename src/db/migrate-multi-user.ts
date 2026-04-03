// src/db/migrate-multi-user.ts

import { db } from "@/db";
import { sql } from "drizzle-orm";

async function migrate() {
  const timestamp = new Date().toISOString();

  // ── Step 1: Create users table ──
  console.log("1/6 Creating users table...");
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // ── Step 2: Seed existing user (Neel) ──
  console.log("2/6 Seeding existing user...");
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !passwordHash) {
    throw new Error(
      "ADMIN_USERNAME and ADMIN_PASSWORD_HASH env vars are required",
    );
  }

  await db.run(sql`
    INSERT OR IGNORE INTO users (id, username, password_hash, name, created_at)
    VALUES ('1', ${username}, ${passwordHash}, 'Neel', ${timestamp})
  `);

  // ── Step 3: Add user_id to workout_logs ──
  console.log("3/6 Adding user_id to workout_logs...");
  try {
    await db.run(sql`
      ALTER TABLE workout_logs
      ADD COLUMN user_id TEXT NOT NULL DEFAULT '1'
      REFERENCES users(id) ON DELETE CASCADE
    `);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("duplicate column")) {
      console.log("   → column already exists, skipping");
    } else {
      throw e;
    }
  }

  // ── Step 4: Recreate workout_plans (change unique constraint) ──
  console.log("4/6 Migrating workout_plans...");

  // 4a. Rename old table
  await db.run(sql`
    ALTER TABLE workout_plans RENAME TO workout_plans_old
  `);

  // 4b. Create new table with user_id + composite unique
  await db.run(sql`
    CREATE TABLE workout_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT '1' REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      title TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, date)
    )
  `);

  // 4c. Copy data, assigning all to user '1'
  await db.run(sql`
    INSERT INTO workout_plans (id, user_id, date, title, notes, created_at)
    SELECT id, '1', date, title, notes, created_at
    FROM workout_plans_old
  `);

  // 4d. Repoint the FK in workout_plan_exercises
  //     (references plan id, which we preserved — no change needed)

  // 4e. Drop old table
  await db.run(sql`DROP TABLE workout_plans_old`);

  // ── Step 5: Ensure user_profiles row exists for Neel ──
  console.log("5/6 Ensuring profile exists...");
  await db.run(sql`
    INSERT OR IGNORE INTO user_profiles (
      id, name, created_at, updated_at
    ) VALUES (
      '1', 'Neel', ${timestamp}, ${timestamp}
    )
  `);

  // ── Step 6: Verify ──
  console.log("6/6 Verifying migration...");

  const [userCount] = await db.all<{ count: number }>(
    sql`SELECT COUNT(*) as count FROM users`,
  );
  const [logCount] = await db.all<{ count: number }>(
    sql`SELECT COUNT(*) as count FROM workout_logs WHERE user_id = '1'`,
  );
  const [planCount] = await db.all<{ count: number }>(
    sql`SELECT COUNT(*) as count FROM workout_plans WHERE user_id = '1'`,
  );

  console.log("\n✅ Migration complete!");
  console.log(`   Users:         ${userCount?.count ?? 0}`);
  console.log(`   Workout logs:  ${logCount?.count ?? 0} (owned by user '1')`);
  console.log(`   Workout plans: ${planCount?.count ?? 0} (owned by user '1')`);
  console.log("\n   All existing data is now owned by Neel (user_id = '1').");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
