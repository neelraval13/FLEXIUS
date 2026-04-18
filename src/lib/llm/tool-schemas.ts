// src/lib/llm/tool-schemas.ts

import type { ToolSchema } from "@/types/llm";

/**
 * All 13 Flexius tool declarations in standard JSON Schema format.
 * Each adapter converts these to its provider's native format.
 */
export const toolSchemas: ToolSchema[] = [
  {
    name: "getExerciseHistory",
    description:
      "Get all past workout logs for a specific exercise, sorted by most recent first. Use this to check progress, find recent working weights, identify PRs, or review training frequency for an exercise.",
    parameters: {
      type: "object",
      properties: {
        exerciseId: {
          type: "number",
          description: "The numeric ID of the exercise from the database",
        },
        source: {
          type: "string",
          description:
            'Which table the exercise is from: "exercise" for strength exercises, "cardio_stretching" for cardio/stretching entries',
          enum: ["exercise", "cardio_stretching"],
        },
      },
      required: ["exerciseId", "source"],
    },
  },
  {
    name: "getWorkoutsByDate",
    description:
      'Get all workout logs for a specific date with exercise names resolved. Use when the user asks things like "What did I do yesterday?" or "Show me my Monday workout".',
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "getWorkoutsByDateRange",
    description:
      'Get all workout logs within a date range. Use for questions like "What did I do this week?" or "Show me my workouts for March". Returns logs with exercise names, sorted by date descending.',
    parameters: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "Start date in YYYY-MM-DD format (inclusive)",
        },
        endDate: {
          type: "string",
          description: "End date in YYYY-MM-DD format (inclusive)",
        },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "logWorkout",
    description:
      'Log a single workout entry. Use when the user says things like "I did 3x10 bench press at 60kg" or "Log 20 min treadmill". Always confirm the details before calling this. If logging from a workout plan, include the planExerciseId to mark it as completed.',
    parameters: {
      type: "object",
      properties: {
        exerciseId: {
          type: "number",
          description: "The numeric ID of the exercise",
        },
        source: {
          type: "string",
          description: "Which table the exercise is from",
          enum: ["exercise", "cardio_stretching"],
        },
        performedAt: {
          type: "string",
          description:
            "Date the workout was performed in YYYY-MM-DD format. Defaults to today if not specified.",
        },
        sets: {
          type: "number",
          description: "Number of sets performed",
        },
        reps: {
          type: "number",
          description: "Number of reps per set (omit for cardio/stretching)",
        },
        weight: {
          type: "number",
          description: "Weight used (omit for bodyweight or cardio exercises)",
        },
        unit: {
          type: "string",
          description: 'Weight unit, defaults to "kg"',
          enum: ["kg", "lbs"],
        },
        durationMinutes: {
          type: "number",
          description: "Duration in minutes (primarily for cardio/stretching)",
        },
        notes: {
          type: "string",
          description: "Optional notes (e.g., form observations, RPE, etc.)",
        },
        planExerciseId: {
          type: "number",
          description:
            "The plan exercise ID from the user's current workout plan context. Pass this when logging an exercise that belongs to today's plan so it gets marked as completed.",
        },
      },
      required: ["exerciseId", "source", "performedAt", "sets"],
    },
  },
  {
    name: "logBatchWorkouts",
    description:
      'Log multiple sets of the same exercise with varying reps/weight. Use when the user gives per-set details like "Bench press: 10x60, 8x65, 6x70". Each set becomes a separate log entry. Always confirm details before calling. If logging from a workout plan, include the planExerciseId to mark it as completed.',
    parameters: {
      type: "object",
      properties: {
        exerciseId: {
          type: "number",
          description: "The numeric ID of the exercise",
        },
        source: {
          type: "string",
          description: "Which table the exercise is from",
          enum: ["exercise", "cardio_stretching"],
        },
        performedAt: {
          type: "string",
          description: "Date the workout was performed in YYYY-MM-DD format",
        },
        sets: {
          type: "array",
          description: "Array of individual set entries",
          items: {
            type: "object",
            properties: {
              reps: {
                type: "number",
                description: "Reps for this set",
              },
              weight: {
                type: "number",
                description: "Weight for this set",
              },
            },
            required: ["reps"],
          },
        },
        unit: {
          type: "string",
          description: 'Weight unit for all sets, defaults to "kg"',
          enum: ["kg", "lbs"],
        },
        durationMinutes: {
          type: "number",
          description: "Duration in minutes (for cardio/stretching)",
        },
        notes: {
          type: "string",
          description: "Optional notes applied to all sets",
        },
        planExerciseId: {
          type: "number",
          description:
            "The plan exercise ID from the user's current workout plan context. Pass this when logging an exercise that belongs to today's plan so it gets marked as completed.",
        },
      },
      required: ["exerciseId", "source", "performedAt", "sets"],
    },
  },
  {
    name: "getTodayPlan",
    description:
      "Check if a workout plan already exists for today. Returns plan details including each exercise's planExerciseId (for modify/remove) and exerciseId (database ID). Use this before saving a new plan or modifying an existing one.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "saveWorkoutPlan",
    description:
      "Save a finalized workout plan for a given date. Call this ONLY when the user explicitly confirms/finalizes the plan. Each exercise must reference a valid exercise ID from the database. Use getExerciseHistory first to suggest appropriate weights based on past performance.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "ISO date string (YYYY-MM-DD) for the plan",
        },
        title: {
          type: "string",
          description:
            "Short descriptive title, e.g. 'Push Day \u2014 Chest & Triceps'",
        },
        notes: {
          type: "string",
          description:
            "Overall tips or notes for the session (warm-up reminders, focus cues, etc.)",
        },
        exercises: {
          type: "array",
          description: "Ordered list of exercises in the plan",
          items: {
            type: "object",
            properties: {
              exerciseId: {
                type: "number",
                description: "ID of the exercise from the database",
              },
              exerciseSource: {
                type: "string",
                description: "'exercise' or 'cardio_stretching'",
              },
              sets: { type: "number", description: "Number of sets" },
              reps: { type: "number", description: "Number of reps per set" },
              targetWeight: {
                type: "number",
                description:
                  "Suggested weight based on user history. Omit for bodyweight/cardio.",
              },
              unit: {
                type: "string",
                description: "'kg' or 'lbs', defaults to 'kg'",
              },
              restSeconds: {
                type: "number",
                description: "Rest time between sets in seconds",
              },
              notes: {
                type: "string",
                description: "Per-exercise coaching cues or notes",
              },
            },
            required: ["exerciseId", "exerciseSource"],
          },
        },
      },
      required: ["date", "exercises"],
    },
  },
  {
    name: "addExercisesToPlan",
    description:
      "Add one or more exercises to the user's existing workout plan for today. Use this when they want to add an exercise without replacing the whole plan. Always call getTodayPlan first to get the planId.",
    parameters: {
      type: "object",
      properties: {
        planId: {
          type: "number",
          description: "The plan ID from getTodayPlan",
        },
        exercises: {
          type: "array",
          description: "Exercises to add to the plan",
          items: {
            type: "object",
            properties: {
              exerciseId: {
                type: "number",
                description: "ID of the exercise from the database",
              },
              exerciseSource: {
                type: "string",
                description: "'exercise' or 'cardio_stretching'",
                enum: ["exercise", "cardio_stretching"],
              },
              sets: { type: "number" },
              reps: { type: "number" },
              targetWeight: { type: "number" },
              unit: { type: "string", enum: ["kg", "lbs"] },
              restSeconds: { type: "number" },
              notes: { type: "string" },
            },
            required: ["exerciseId", "exerciseSource"],
          },
        },
      },
      required: ["planId", "exercises"],
    },
  },
  {
    name: "removeExerciseFromPlan",
    description:
      "Remove a specific exercise from today's workout plan. Use the planExerciseId (from getTodayPlan), NOT the exercise database ID.",
    parameters: {
      type: "object",
      properties: {
        planExerciseId: {
          type: "number",
          description: "The workout_plan_exercises.id from getTodayPlan",
        },
      },
      required: ["planExerciseId"],
    },
  },
  {
    name: "replacePlanExercise",
    description:
      "Replace a specific exercise in today's plan with a different one. Keeps the same position. Use the planExerciseId (from getTodayPlan) to identify which exercise to replace.",
    parameters: {
      type: "object",
      properties: {
        planExerciseId: {
          type: "number",
          description:
            "The workout_plan_exercises.id to replace, from getTodayPlan",
        },
        newExercise: {
          type: "object",
          description: "The replacement exercise details",
          properties: {
            exerciseId: {
              type: "number",
              description: "ID of the new exercise from the database",
            },
            exerciseSource: {
              type: "string",
              description: "'exercise' or 'cardio_stretching'",
              enum: ["exercise", "cardio_stretching"],
            },
            sets: { type: "number" },
            reps: { type: "number" },
            targetWeight: { type: "number" },
            unit: { type: "string", enum: ["kg", "lbs"] },
            restSeconds: { type: "number" },
            notes: { type: "string" },
          },
          required: ["exerciseId", "exerciseSource"],
        },
      },
      required: ["planExerciseId", "newExercise"],
    },
  },
  {
    name: "createExercise",
    description:
      "Create a new strength exercise in the database when the user mentions one that doesn't exist in the exercise list. Call this ONLY after confirming with the user.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Exercise name (e.g. 'Bulgarian Split Squat')",
        },
        targetMuscle: {
          type: "string",
          description: "Primary target muscle (e.g. 'Quads', 'Chest', 'Lats')",
        },
        muscleGroup: {
          type: "string",
          description:
            "Major muscle group: 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs'",
        },
        equipment: {
          type: "array",
          items: { type: "string" },
          description: "Equipment names. Use ['Bodyweight'] if none needed.",
        },
        difficulty: {
          type: "string",
          description: "Exercise difficulty level",
          enum: ["Beginner", "Intermediate", "Advanced"],
        },
        alternatives: {
          type: "array",
          items: { type: "string" },
          description: "Names of similar/alternative exercises (can be empty)",
        },
        videoUrl: {
          type: "string",
          description:
            "YouTube URL for form reference. Empty string if unknown.",
        },
      },
      required: [
        "name",
        "targetMuscle",
        "muscleGroup",
        "equipment",
        "difficulty",
      ],
    },
  },
  {
    name: "createCardioStretching",
    description:
      "Create a new cardio, core, oblique, or stretching entry in the database when the user mentions one that doesn't exist. Call this ONLY after confirming with the user.",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Exercise name (e.g. 'Mountain Climbers')",
        },
        category: {
          type: "string",
          description: "Category for this entry",
          enum: [
            "Cardio",
            "Core",
            "Obliques",
            "Stretching",
            "Stretching & Recovery",
          ],
        },
        targetMuscle: {
          type: "string",
          description: "Primary target muscle or area",
        },
        equipment: {
          type: "array",
          items: { type: "string" },
          description: "Equipment needed, or ['Bodyweight'] if none",
        },
        difficulty: {
          type: "string",
          description: "Exercise difficulty level",
          enum: ["Beginner", "Intermediate", "Advanced"],
        },
        alternatives: {
          type: "array",
          items: { type: "string" },
          description: "Names of similar/alternative exercises (can be empty)",
        },
        videoUrl: {
          type: "string",
          description: "YouTube URL. Empty string if unknown.",
        },
      },
      required: ["name", "category", "targetMuscle", "equipment", "difficulty"],
    },
  },
  {
    name: "analyzeReel",
    description:
      "Analyze an Instagram reel video to identify exercises, form, equipment, and techniques shown. Use this when the user shares an Instagram reel URL.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "The full Instagram reel URL" },
        prompt: {
          type: "string",
          description: "Optional specific analysis prompt.",
        },
      },
      required: ["url"],
    },
  },
];
