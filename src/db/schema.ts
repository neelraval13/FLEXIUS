import {
  sqliteTable,
  integer,
  text,
  real,
  unique,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // nanoid
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

// 1. Exercises
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  targetMuscle: text("target_muscle").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipmentUsed: text("equipment_used").notNull(),
  difficulty: text("difficulty").notNull(),
  alternatives: text("alternatives").notNull(),
  videoUrl: text("video_url"),
});

// 2. Cardio / Stretching
export const cardioStretching = sqliteTable("cardio_stretching", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  targetMuscle: text("target_muscle").notNull(),
  category: text("category").notNull(),
  equipmentUsed: text("equipment_used").notNull(),
  difficulty: text("difficulty").notNull(),
  alternatives: text("alternatives").notNull(),
  videoUrl: text("video_url"),
});

// 3. Equipment
export const equipment = sqliteTable("equipment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

// 4. Muscle Groups
export const muscleGroups = sqliteTable("muscle_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  majorGroup: text("major_group").notNull(),
  targetMuscle: text("target_muscle").notNull(),
});

// 5. Workout Plans
export const workoutPlans = sqliteTable(
  "workout_plans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    title: text("title"),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [unique().on(table.userId, table.date)],
);
// 6. Workout Plan Exercises
export const workoutPlanExercises = sqliteTable("workout_plan_exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id")
    .notNull()
    .references(() => workoutPlans.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id").notNull(),
  exerciseSource: text("exercise_source").notNull(),
  orderIndex: integer("order_index").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  targetWeight: real("target_weight"),
  unit: text("unit").default("kg"),
  restSeconds: integer("rest_seconds"),
  notes: text("notes"),
  completed: integer("completed").default(0),
});

// 7. Workout Logs
export const workoutLogs = sqliteTable("workout_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id").notNull(),
  exerciseSource: text("exercise_source").notNull(),
  performedAt: text("performed_at").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: real("weight"),
  unit: text("unit"),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
});

// 8. User Profiles
export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(), // ← remove .references(() => users.id, ...)
  name: text("name").notNull(),
  height: real("height"),
  weight: real("weight"),
  heightUnit: text("height_unit").notNull().default("cm"),
  weightUnit: text("weight_unit").notNull().default("kg"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  fitnessGoal: text("fitness_goal"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// 9. Favorite Exercises
export const favoriteExercises = sqliteTable(
  "favorite_exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id").notNull(),
    source: text("source", {
      enum: ["exercise", "cardio_stretching"],
    }).notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [unique().on(table.userId, table.exerciseId, table.source)],
);
