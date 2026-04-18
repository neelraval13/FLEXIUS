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
  timezone: string;
  llmProvider: string;
  llmApiKey: string | null;
  llmModel: string | null;
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
  timezone?: string;
  llmProvider?: string;
  llmApiKey?: string | null;
  llmModel?: string | null;
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

export const LLM_PROVIDERS = [
  { value: "gemini", label: "Gemini" },
  { value: "claude", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
] as const;

export const LLM_MODELS: Record<string, { value: string; label: string }[]> = {
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  ],
  claude: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "claude-haiku-4-20250414", label: "Claude Haiku 4" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
  ],
};
