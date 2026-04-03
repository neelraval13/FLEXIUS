// src/types/profile.ts

export interface UserProfile {
  id: string;
  name: string;
  height: number | null;
  weight: number | null;
  heightUnit: string;
  weightUnit: string;
  dateOfBirth: string | null;
  gender: string | null;
  fitnessGoal: string | null;
}

export interface UpdateProfileInput {
  name: string;
  height: number | null;
  weight: number | null;
  heightUnit: string;
  weightUnit: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  fitnessGoal?: string | null;
}

export interface FavoriteExercise {
  id: number;
  exerciseId: number;
  source: "exercise" | "cardio_stretching";
  name: string; // joined from exercise/cardio table
  targetMuscle: string;
}

export const FITNESS_GOALS = [
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "fat_loss", label: "Fat Loss" },
  { value: "maintenance", label: "Maintenance" },
  { value: "endurance", label: "Endurance" },
  { value: "flexibility", label: "Flexibility" },
] as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;
