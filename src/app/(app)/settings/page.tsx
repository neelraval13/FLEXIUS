// src/app/(app)/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getAllEquipment,
  getAllMuscleGroups,
  getAllExercises,
  getAllCardioStretching,
} from "@/db/queries";
import SettingsPageClient from "@/components/settings/settings-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

const SettingsPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [equipment, muscleGroups, exercises, cardioStretching] =
    await Promise.all([
      getAllEquipment(userId),
      getAllMuscleGroups(userId),
      getAllExercises(userId),
      getAllCardioStretching(userId),
    ]);

  const mappedEquipment = equipment.map((e) => ({
    id: e.id,
    name: e.name,
  }));

  const mappedMuscleGroups = muscleGroups.map((mg) => ({
    id: mg.id,
    majorGroup: mg.majorGroup,
    targetMuscle: mg.targetMuscle,
  }));

  const mappedExercises = exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    targetMuscle: ex.targetMuscle,
    muscleGroup: ex.muscleGroup,
    equipmentUsed: ex.equipmentUsed,
    difficulty: ex.difficulty,
    alternatives: ex.alternatives,
    videoUrl: ex.videoUrl,
  }));

  const mappedCardioStretching = cardioStretching.map((cs) => ({
    id: cs.id,
    name: cs.name,
    targetMuscle: cs.targetMuscle,
    category: cs.category,
    equipmentUsed: cs.equipmentUsed,
    difficulty: cs.difficulty,
    alternatives: cs.alternatives,
    videoUrl: cs.videoUrl,
  }));

  return (
    <SettingsPageClient
      equipment={mappedEquipment}
      muscleGroups={mappedMuscleGroups}
      exercises={mappedExercises}
      cardioStretching={mappedCardioStretching}
    />
  );
};

export default SettingsPage;
