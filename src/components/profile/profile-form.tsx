// src/components/profile/profile-form.tsx

"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions/profile-actions";
import { Save, Loader2 } from "lucide-react";
import { FITNESS_GOALS, GENDER_OPTIONS } from "@/types/profile";
import type { UserProfile } from "@/types/profile";

interface ProfileFormProps {
  profile: UserProfile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(profile?.name ?? "");
  const [height, setHeight] = useState(profile?.height?.toString() ?? "");
  const [weight, setWeight] = useState(profile?.weight?.toString() ?? "");
  const [heightUnit, setHeightUnit] = useState(profile?.heightUnit ?? "cm");
  const [weightUnit, setWeightUnit] = useState(profile?.weightUnit ?? "kg");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [fitnessGoal, setFitnessGoal] = useState(profile?.fitnessGoal ?? "");

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfileAction({
        name: name.trim() || "User",
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        heightUnit,
        weightUnit,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        fitnessGoal: fitnessGoal || null,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl bg-neutral-900 p-4">
      <h2 className="text-lg font-semibold text-white">Your Details</h2>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm text-neutral-400">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Height */}
      <div className="space-y-1.5">
        <label className="text-sm text-neutral-400">Height</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={heightUnit === "cm" ? "175" : "5.9"}
            step={heightUnit === "cm" ? "1" : "0.1"}
            className="flex-1 rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <div className="flex rounded-lg bg-neutral-800 p-1">
            {["cm", "ft"].map((unit) => (
              <button
                key={unit}
                onClick={() => setHeightUnit(unit)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  heightUnit === unit
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="space-y-1.5">
        <label className="text-sm text-neutral-400">Weight</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={weightUnit === "kg" ? "70" : "154"}
            step="0.1"
            className="flex-1 rounded-lg bg-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <div className="flex rounded-lg bg-neutral-800 p-1">
            {["kg", "lbs"].map((unit) => (
              <button
                key={unit}
                onClick={() => setWeightUnit(unit)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  weightUnit === unit
                    ? "bg-blue-600 text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date of Birth */}
      <div className="space-y-1.5">
        <label className="text-sm text-neutral-400">
          Date of Birth <span className="text-neutral-600">(optional)</span>
        </label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full rounded-lg bg-neutral-800 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <label className="text-sm text-neutral-400">
          Gender <span className="text-neutral-600">(optional)</span>
        </label>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGender(gender === opt.value ? "" : opt.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                gender === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fitness Goal */}
      <div className="space-y-1.5">
        <label className="text-sm text-neutral-400">Fitness Goal</label>
        <div className="flex flex-wrap gap-2">
          {FITNESS_GOALS.map((goal) => (
            <button
              key={goal.value}
              onClick={() =>
                setFitnessGoal(fitnessGoal === goal.value ? "" : goal.value)
              }
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                fitnessGoal === goal.value
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={isPending || !name.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Save className="h-5 w-5" />
        )}
        {saved ? "Saved!" : "Save Profile"}
      </button>
    </div>
  );
}
