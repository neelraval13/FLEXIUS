// src/lib/plan-context.ts
import type { TodayPlanData } from "@/types/workout-plan";

export function buildPlanContext(plan: TodayPlanData): string {
  const lines = [`Plan: ${plan.title}`];

  if (plan.notes) lines.push(`Notes: ${plan.notes}`);

  plan.exercises.forEach((ex, i) => {
    const status = ex.completed ? "✅" : "⬜";
    const weight = ex.targetWeight ? ` @ ${ex.targetWeight}${ex.unit}` : "";
    const rest = ex.restSeconds ? ` | Rest: ${ex.restSeconds}s` : "";
    const notes = ex.notes ? ` | ${ex.notes}` : "";

    lines.push(
      `${status} ${i + 1}. ${ex.name} [planExerciseId:${ex.id}, source:${ex.exerciseSource}, exerciseId:${ex.exerciseId}] (${ex.targetMuscle}) — ${ex.sets}×${ex.reps}${weight}${rest}${notes}`,
    );
  });

  const done = plan.exercises.filter((e) => e.completed).length;
  lines.push(`\nProgress: ${done}/${plan.exercises.length} completed`);

  return lines.join("\n");
}
