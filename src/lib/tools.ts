// src/lib/tools.ts
import { Type, type FunctionDeclaration } from "@google/genai";
import {
  getWorkoutLogsByExercise,
  getWorkoutLogsWithExerciseName,
  getWorkoutLogsByDateRange,
  searchExercises,
  searchCardioStretching,
  getAllExercises,
  getAllCardioStretching,
} from "@/db/queries";
import { createWorkoutLog, createBatchWorkoutLogs } from "@/app/actions";
import { createExercise } from "@/app/actions/exercise-actions";
import { createCardioStretching } from "@/app/actions/cardio-stretching-actions";
import { getTodayPlan } from "@/db/queries/workout-plans";
import {
  createWorkoutPlan,
  addExercisesToPlan,
  removeExerciseFromPlan,
  replacePlanExercise,
} from "@/app/actions/workout-plan-actions";
import { getUserTimezone } from "@/db/queries/profile";

// ─── Tool Declarations ───────────────────────────────────────────────

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "getExerciseHistory",
    description:
      "Get all past workout logs for a specific exercise, sorted by most recent first. Use this to check progress, find recent working weights, identify PRs, or review training frequency for an exercise.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        exerciseId: {
          type: Type.NUMBER,
          description: "The numeric ID of the exercise from the database",
        },
        source: {
          type: Type.STRING,
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
      type: Type.OBJECT,
      properties: {
        date: {
          type: Type.STRING,
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
      type: Type.OBJECT,
      properties: {
        startDate: {
          type: Type.STRING,
          description: "Start date in YYYY-MM-DD format (inclusive)",
        },
        endDate: {
          type: Type.STRING,
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
      type: Type.OBJECT,
      properties: {
        exerciseId: {
          type: Type.NUMBER,
          description: "The numeric ID of the exercise",
        },
        source: {
          type: Type.STRING,
          description: "Which table the exercise is from",
          enum: ["exercise", "cardio_stretching"],
        },
        performedAt: {
          type: Type.STRING,
          description:
            "Date the workout was performed in YYYY-MM-DD format. Defaults to today if not specified.",
        },
        sets: {
          type: Type.NUMBER,
          description: "Number of sets performed",
        },
        reps: {
          type: Type.NUMBER,
          description: "Number of reps per set (omit for cardio/stretching)",
        },
        weight: {
          type: Type.NUMBER,
          description: "Weight used (omit for bodyweight or cardio exercises)",
        },
        unit: {
          type: Type.STRING,
          description: 'Weight unit, defaults to "kg"',
          enum: ["kg", "lbs"],
        },
        durationMinutes: {
          type: Type.NUMBER,
          description: "Duration in minutes (primarily for cardio/stretching)",
        },
        notes: {
          type: Type.STRING,
          description: "Optional notes (e.g., form observations, RPE, etc.)",
        },
        planExerciseId: {
          type: Type.NUMBER,
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
      type: Type.OBJECT,
      properties: {
        exerciseId: {
          type: Type.NUMBER,
          description: "The numeric ID of the exercise",
        },
        source: {
          type: Type.STRING,
          description: "Which table the exercise is from",
          enum: ["exercise", "cardio_stretching"],
        },
        performedAt: {
          type: Type.STRING,
          description: "Date the workout was performed in YYYY-MM-DD format",
        },
        sets: {
          type: Type.ARRAY,
          description: "Array of individual set entries",
          items: {
            type: Type.OBJECT,
            properties: {
              reps: {
                type: Type.NUMBER,
                description: "Reps for this set",
              },
              weight: {
                type: Type.NUMBER,
                description: "Weight for this set",
              },
            },
            required: ["reps"],
          },
        },
        unit: {
          type: Type.STRING,
          description: 'Weight unit for all sets, defaults to "kg"',
          enum: ["kg", "lbs"],
        },
        durationMinutes: {
          type: Type.NUMBER,
          description: "Duration in minutes (for cardio/stretching)",
        },
        notes: {
          type: Type.STRING,
          description: "Optional notes applied to all sets",
        },
        planExerciseId: {
          type: Type.NUMBER,
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
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "saveWorkoutPlan",
    description:
      "Save a finalized workout plan for a given date. Call this ONLY when the user explicitly confirms/finalizes the plan. Each exercise must reference a valid exercise ID from the database. Use getExerciseHistory first to suggest appropriate weights based on past performance.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: {
          type: Type.STRING,
          description: "ISO date string (YYYY-MM-DD) for the plan",
        },
        title: {
          type: Type.STRING,
          description:
            "Short descriptive title, e.g. 'Push Day — Chest & Triceps'",
        },
        notes: {
          type: Type.STRING,
          description:
            "Overall tips or notes for the session (warm-up reminders, focus cues, etc.)",
        },
        exercises: {
          type: Type.ARRAY,
          description: "Ordered list of exercises in the plan",
          items: {
            type: Type.OBJECT,
            properties: {
              exerciseId: {
                type: Type.NUMBER,
                description: "ID of the exercise from the database",
              },
              exerciseSource: {
                type: Type.STRING,
                description: "'exercise' or 'cardio_stretching'",
              },
              sets: {
                type: Type.NUMBER,
                description: "Number of sets",
              },
              reps: {
                type: Type.NUMBER,
                description: "Number of reps per set",
              },
              targetWeight: {
                type: Type.NUMBER,
                description:
                  "Suggested weight based on user history. Omit for bodyweight/cardio.",
              },
              unit: {
                type: Type.STRING,
                description: "'kg' or 'lbs', defaults to 'kg'",
              },
              restSeconds: {
                type: Type.NUMBER,
                description: "Rest time between sets in seconds",
              },
              notes: {
                type: Type.STRING,
                description:
                  "Per-exercise coaching cues or notes (e.g. 'Focus on slow negatives')",
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
      type: Type.OBJECT,
      properties: {
        planId: {
          type: Type.NUMBER,
          description: "The plan ID from getTodayPlan",
        },
        exercises: {
          type: Type.ARRAY,
          description: "Exercises to add to the plan",
          items: {
            type: Type.OBJECT,
            properties: {
              exerciseId: {
                type: Type.NUMBER,
                description: "ID of the exercise from the database",
              },
              exerciseSource: {
                type: Type.STRING,
                description: "'exercise' or 'cardio_stretching'",
                enum: ["exercise", "cardio_stretching"],
              },
              sets: { type: Type.NUMBER },
              reps: { type: Type.NUMBER },
              targetWeight: { type: Type.NUMBER },
              unit: {
                type: Type.STRING,
                enum: ["kg", "lbs"],
              },
              restSeconds: { type: Type.NUMBER },
              notes: { type: Type.STRING },
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
      type: Type.OBJECT,
      properties: {
        planExerciseId: {
          type: Type.NUMBER,
          description:
            "The workout_plan_exercises.id from getTodayPlan (listed as 'planExerciseId' in the response)",
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
      type: Type.OBJECT,
      properties: {
        planExerciseId: {
          type: Type.NUMBER,
          description:
            "The workout_plan_exercises.id to replace, from getTodayPlan",
        },
        newExercise: {
          type: Type.OBJECT,
          description: "The replacement exercise details",
          properties: {
            exerciseId: {
              type: Type.NUMBER,
              description: "ID of the new exercise from the database",
            },
            exerciseSource: {
              type: Type.STRING,
              description: "'exercise' or 'cardio_stretching'",
              enum: ["exercise", "cardio_stretching"],
            },
            sets: { type: Type.NUMBER },
            reps: { type: Type.NUMBER },
            targetWeight: { type: Type.NUMBER },
            unit: {
              type: Type.STRING,
              enum: ["kg", "lbs"],
            },
            restSeconds: { type: Type.NUMBER },
            notes: { type: Type.STRING },
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
      "Create a new strength exercise in the database when the user mentions one that doesn't exist in the exercise list. Call this ONLY after confirming with the user. The new exercise will be available immediately for plans and logging.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Exercise name (e.g. 'Bulgarian Split Squat')",
        },
        targetMuscle: {
          type: Type.STRING,
          description:
            "Primary target muscle matching an existing target_muscle in the muscle_groups table (e.g. 'Quads', 'Chest', 'Lats')",
        },
        muscleGroup: {
          type: Type.STRING,
          description:
            "Major muscle group matching an existing major_group: 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs'",
        },
        equipment: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Equipment names from the gym equipment list. Use ['Bodyweight'] if none needed.",
        },
        difficulty: {
          type: Type.STRING,
          description: "Exercise difficulty level",
          enum: ["Beginner", "Intermediate", "Advanced"],
        },
        alternatives: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Names of similar/alternative exercises (can be empty)",
        },
        videoUrl: {
          type: Type.STRING,
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
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Exercise name (e.g. 'Mountain Climbers')",
        },
        category: {
          type: Type.STRING,
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
          type: Type.STRING,
          description: "Primary target muscle or area",
        },
        equipment: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Equipment needed, or ['Bodyweight'] if none",
        },
        difficulty: {
          type: Type.STRING,
          description: "Exercise difficulty level",
          enum: ["Beginner", "Intermediate", "Advanced"],
        },
        alternatives: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Names of similar/alternative exercises (can be empty)",
        },
        videoUrl: {
          type: Type.STRING,
          description: "YouTube URL. Empty string if unknown.",
        },
      },
      required: ["name", "category", "targetMuscle", "equipment", "difficulty"],
    },
  },
  {
    name: "analyzeReel",
    description:
      "Analyze an Instagram reel video to identify exercises, form, equipment, and techniques shown. Use this when the user shares an Instagram reel URL (instagram.com/reel/... or instagram.com/p/...).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: "The full Instagram reel URL",
        },
        prompt: {
          type: Type.STRING,
          description:
            "Optional specific analysis prompt. If omitted, defaults to identifying exercises, target muscles, equipment, and form cues.",
        },
      },
      required: ["url"],
    },
  },
];

// ─── Tool Executor ───────────────────────────────────────────────────

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

const getTodayISO = (timezone = "Asia/Kolkata"): string => {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
};

type ToolArgs = Record<string, unknown>;

type ToolHandler = (args: ToolArgs, userId: string) => Promise<ToolResult>;

const toolHandlers: Record<string, ToolHandler> = {
  getExerciseHistory: async (args, userId) => {
    const logs = await getWorkoutLogsByExercise(
      userId,
      args.exerciseId as number,
      args.source as "exercise" | "cardio_stretching",
    );

    return {
      success: true,
      data: {
        count: logs.length,
        logs: logs.map((log) => ({
          id: log.id,
          date: log.performedAt,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          unit: log.unit,
          durationMinutes: log.durationMinutes,
          notes: log.notes,
        })),
      },
    };
  },

  getWorkoutsByDate: async (args, userId) => {
    const date = args.date as string;
    const logs = await getWorkoutLogsWithExerciseName(userId, date);

    return {
      success: true,
      data: {
        date,
        count: logs.length,
        logs: logs.map((log) => ({
          id: log.id,
          exerciseName: log.exerciseName,
          source: log.exerciseSource,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          unit: log.unit,
          durationMinutes: log.durationMinutes,
          notes: log.notes,
        })),
      },
    };
  },

  getWorkoutsByDateRange: async (args, userId) => {
    const startDate = args.startDate as string;
    const endDate = args.endDate as string;
    const logs = await getWorkoutLogsByDateRange(userId, startDate, endDate);

    return {
      success: true,
      data: {
        startDate,
        endDate,
        count: logs.length,
        logs: logs.map((log) => ({
          id: log.id,
          exerciseId: log.exerciseId,
          source: log.exerciseSource,
          date: log.performedAt,
          sets: log.sets,
          reps: log.reps,
          weight: log.weight,
          unit: log.unit,
          durationMinutes: log.durationMinutes,
          notes: log.notes,
        })),
      },
    };
  },

  logWorkout: async (args, userId) => {
    const timezone = await getUserTimezone(userId);
    const result = await createWorkoutLog({
      exerciseId: args.exerciseId as number,
      exerciseSource: args.source as "exercise" | "cardio_stretching",
      performedAt: (args.performedAt as string) || getTodayISO(timezone),
      sets: args.sets as number,
      reps: (args.reps as number) ?? null,
      weight: (args.weight as number) ?? null,
      unit: (args.unit as string as "kg" | "lbs") ?? "kg",
      durationMinutes: (args.durationMinutes as number) ?? null,
      notes: (args.notes as string) ?? null,
    });

    return {
      success: true,
      data: {
        message: "Workout logged successfully",
        logId: result?.id,
      },
    };
  },

  logBatchWorkouts: async (args, userId) => {
    const timezone = await getUserTimezone(userId);
    const sets = args.sets as { reps: number; weight?: number }[];
    const totalSets = sets.length;
    const unit = (args.unit as string as "kg" | "lbs") ?? "kg";

    const inputs = sets.map((set, index) => ({
      exerciseId: args.exerciseId as number,
      exerciseSource: args.source as "exercise" | "cardio_stretching",
      performedAt: (args.performedAt as string) || getTodayISO(timezone),
      sets: 1,
      reps: set.reps ?? null,
      weight: set.weight ?? null,
      unit,
      durationMinutes: (args.durationMinutes as number) ?? null,
      notes: (args.notes as string) ?? `Set ${index + 1} of ${totalSets}`,
    }));

    await createBatchWorkoutLogs(inputs);

    return {
      success: true,
      data: {
        message: `${totalSets} sets logged successfully`,
        setsLogged: totalSets,
      },
    };
  },

  getTodayPlan: async (_args, userId) => {
    try {
      const plan = await getTodayPlan(userId);
      if (!plan) {
        return {
          success: true,
          data: { exists: false, plan: null },
        };
      }

      // Resolve exercise names for the AI
      const [exercises, cardioStretching] = await Promise.all([
        getAllExercises(userId),
        getAllCardioStretching(userId),
      ]);

      const nameMap = new Map<string, string>();
      for (const e of exercises) {
        nameMap.set(`exercise:${e.id}`, e.name);
      }
      for (const e of cardioStretching) {
        nameMap.set(`cardio_stretching:${e.id}`, e.name);
      }

      return {
        success: true,
        data: {
          exists: true,
          plan: {
            id: plan.id,
            date: plan.date,
            title: plan.title,
            notes: plan.notes,
            exerciseCount: plan.exercises.length,
            completedCount: plan.exercises.filter((e) => e.completed === 1)
              .length,
            exercises: plan.exercises.map((e) => ({
              planExerciseId: e.id,
              exerciseId: e.exerciseId,
              exerciseSource: e.exerciseSource,
              name:
                nameMap.get(`${e.exerciseSource}:${e.exerciseId}`) ??
                "Unknown Exercise",
              orderIndex: e.orderIndex,
              sets: e.sets,
              reps: e.reps,
              targetWeight: e.targetWeight,
              unit: e.unit,
              restSeconds: e.restSeconds,
              notes: e.notes,
              completed: e.completed === 1,
            })),
          },
          _note:
            "planExerciseId is used for addExercisesToPlan/removeExerciseFromPlan/replacePlanExercise. exerciseId is the database exercise ID.",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch today's plan: ${error}`,
      };
    }
  },

  saveWorkoutPlan: async (args: Record<string, unknown>) => {
    // createWorkoutPlan gets userId internally via auth()
    try {
      const exercises = args.exercises as Array<Record<string, unknown>>;

      if (!exercises || exercises.length === 0) {
        return {
          success: false,
          error: "No exercises provided for the plan",
        };
      }

      const result = await createWorkoutPlan({
        date: args.date as string,
        title: (args.title as string) ?? undefined,
        notes: (args.notes as string) ?? undefined,
        exercises: exercises.map((ex, index) => ({
          exerciseId: ex.exerciseId as number,
          exerciseSource: ex.exerciseSource as string,
          orderIndex: index,
          sets: (ex.sets as number) ?? undefined,
          reps: (ex.reps as number) ?? undefined,
          targetWeight: (ex.targetWeight as number) ?? undefined,
          unit: (ex.unit as string) ?? "kg",
          restSeconds: (ex.restSeconds as number) ?? undefined,
          notes: (ex.notes as string) ?? undefined,
        })),
      });

      return {
        success: true,
        data: {
          planId: result.planId,
          exerciseCount: exercises.length,
          message:
            "Workout plan saved! You can view it on the Today's Workout page.",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save workout plan: ${error}`,
      };
    }
  },

  addExercisesToPlan: async (args) => {
    // addExercisesToPlan gets userId internally via auth()
    try {
      const planId = args.planId as number;
      const exercises = args.exercises as Array<{
        exerciseId: number;
        exerciseSource: "exercise" | "cardio_stretching";
        sets?: number;
        reps?: number;
        targetWeight?: number;
        unit?: string;
        restSeconds?: number;
        notes?: string;
      }>;

      const result = await addExercisesToPlan(planId, exercises);

      return {
        success: true,
        data: {
          added: result.added,
          message: `Added ${result.added} exercise${result.added > 1 ? "s" : ""} to the plan.`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add exercises: ${error}`,
      };
    }
  },

  removeExerciseFromPlan: async (args) => {
    try {
      const result = await removeExerciseFromPlan(
        args.planExerciseId as number,
      );

      if (!result.success) {
        return {
          success: false,
          error: "Failed to remove exercise from plan.",
        };
      }

      return {
        success: true,
        data: { message: "Exercise removed from plan." },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to remove exercise: ${error}`,
      };
    }
  },

  replacePlanExercise: async (args) => {
    try {
      const newExercise = args.newExercise as {
        exerciseId: number;
        exerciseSource: "exercise" | "cardio_stretching";
        sets?: number;
        reps?: number;
        targetWeight?: number;
        unit?: string;
        restSeconds?: number;
        notes?: string;
      };

      const result = await replacePlanExercise(
        args.planExerciseId as number,
        newExercise,
      );

      if (!result.success) {
        return { success: false, error: "Failed to replace exercise in plan." };
      }

      return {
        success: true,
        data: { message: "Exercise replaced in plan." },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to replace exercise: ${error}`,
      };
    }
  },

  createExercise: async (args, userId) => {
    const name = args.name as string;

    const existing = await searchExercises(name, userId);
    const exactMatch = existing.find(
      (e) => e.name.toLowerCase() === name.toLowerCase(),
    );

    if (exactMatch) {
      return {
        success: false,
        error: `Exercise "${exactMatch.name}" already exists with ID ${exactMatch.id}. Use this ID instead.`,
        data: { exerciseId: exactMatch.id, source: "exercise" },
      };
    }

    try {
      const equipment = args.equipment as string[];
      const alternatives = (args.alternatives as string[]) ?? [];

      const created = await createExercise({
        name,
        targetMuscle: args.targetMuscle as string,
        muscleGroup: args.muscleGroup as string,
        equipmentUsed: equipment,
        difficulty: args.difficulty as string,
        alternatives: alternatives,
        videoUrl: (args.videoUrl as string) || null,
      });

      return {
        success: true,
        data: {
          exerciseId: created.id,
          source: "exercise",
          message: `Exercise "${name}" created successfully with ID ${created.id}. You can now use it in plans and logging.`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create exercise: ${error}`,
      };
    }
  },

  createCardioStretching: async (args, userId) => {
    const name = args.name as string;

    const existing = await searchCardioStretching(name, userId);
    const exactMatch = existing.find(
      (e) => e.name.toLowerCase() === name.toLowerCase(),
    );

    if (exactMatch) {
      return {
        success: false,
        error: `"${exactMatch.name}" already exists with ID ${exactMatch.id}. Use this ID instead.`,
        data: {
          exerciseId: exactMatch.id,
          source: "cardio_stretching",
        },
      };
    }

    try {
      const equipment = args.equipment as string[];
      const alternatives = (args.alternatives as string[]) ?? [];

      const created = await createCardioStretching({
        name,
        category: args.category as string,
        targetMuscle: args.targetMuscle as string,
        equipmentUsed: equipment,
        difficulty: (args.difficulty as string) ?? "Beginner",
        alternatives: alternatives,
        videoUrl: (args.videoUrl as string) || null,
      });

      return {
        success: true,
        data: {
          exerciseId: created.id,
          source: "cardio_stretching",
          message: `"${name}" created successfully with ID ${created.id}. You can now use it in plans and logging.`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create entry: ${error}`,
      };
    }
  },

  analyzeReel: async (args) => {
    // External service — no userId needed
    const url = args.url as string;
    const analyzerUrl = process.env.REEL_ANALYZER_URL;
    const analyzerToken = process.env.REEL_ANALYZER_TOKEN;

    if (!analyzerUrl || !analyzerToken) {
      return {
        success: false,
        error: "Reel analyzer service is not configured",
      };
    }

    const defaultPrompt =
      "Identify all exercises shown in this video. For each exercise, " +
      "describe: the exercise name, primary target muscles, secondary " +
      "muscles worked, equipment used, rep/set pattern if visible, " +
      "and any notable form cues or technique tips.";

    try {
      const response = await fetch(analyzerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${analyzerToken}`,
        },
        body: JSON.stringify({
          url,
          prompt: (args.prompt as string) || defaultPrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Reel analysis failed (${response.status}): ${errorText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          analysis: data.analysis ?? data.result ?? data,
          reelUrl: url,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to reach reel analyzer: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
};

export const executeTool = async (
  name: string,
  args: ToolArgs,
  userId: string,
): Promise<ToolResult> => {
  const handler = toolHandlers[name];

  if (!handler) {
    return { success: false, error: `Unknown tool: ${name}` };
  }

  try {
    return await handler(args, userId);
  } catch (error) {
    console.error(`Tool execution error (${name}):`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
