export interface WeeklyStats {
  workoutDays: number;
  totalExercises: number;
  totalSets: number;
  totalVolume: number;
  weekStart: string;
  weekEnd: string;
}

export interface RecentLogEntry {
  id: number;
  exerciseName: string;
  performedAt: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  unit: string | null;
  durationMinutes: number | null;
}
