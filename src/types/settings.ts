export interface EquipmentItem {
  id: number;
  name: string;
}

export interface MuscleGroupItem {
  id: number;
  majorGroup: string;
  targetMuscle: string;
}

export interface ExerciseItem {
  id: number;
  name: string;
  targetMuscle: string;
  muscleGroup: string;
  equipmentUsed: string | null;
  difficulty: string;
  alternatives: string | null;
  videoUrl: string | null;
}

export interface CardioStretchingItem {
  id: number;
  name: string;
  targetMuscle: string;
  category: string;
  equipmentUsed: string | null;
  difficulty: string;
  alternatives: string | null;
  videoUrl: string | null;
}

export type SettingsTab = "equipment" | "muscles" | "exercises" | "cardio";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export const DIFFICULTY_OPTIONS: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];
