"use client";

import type React from "react";
import { useState } from "react";
import { Dumbbell, Heart, Layers, Wrench } from "lucide-react";
import type {
  EquipmentItem,
  MuscleGroupItem,
  ExerciseItem,
  CardioStretchingItem,
  SettingsTab,
} from "@/types/settings";
import SettingsTabBar from "@/components/settings/settings-tab-bar";
import EquipmentTab from "@/components/settings/equipment-tab";
import MuscleGroupsTab from "@/components/settings/muscle-groups-tab";
import ExercisesTab from "@/components/settings/exercises-tab";
import CardioStretchingTab from "@/components/settings/cardio-stretching-tab";

interface SettingsPageClientProps {
  equipment: EquipmentItem[];
  muscleGroups: MuscleGroupItem[];
  exercises: ExerciseItem[];
  cardioStretching: CardioStretchingItem[];
}

const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
  { key: "equipment", label: "Equipment", icon: Wrench },
  { key: "muscles", label: "Muscles", icon: Layers },
  { key: "exercises", label: "Exercises", icon: Dumbbell },
  { key: "cardio", label: "Cardio & More", icon: Heart },
];

const SettingsPageClient: React.FC<SettingsPageClientProps> = ({
  equipment,
  muscleGroups,
  exercises,
  cardioStretching,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("equipment");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your gym equipment, muscles, and exercises
        </p>
      </div>

      <SettingsTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "equipment" && <EquipmentTab equipment={equipment} />}
      {activeTab === "muscles" && (
        <MuscleGroupsTab muscleGroups={muscleGroups} />
      )}
      {activeTab === "exercises" && (
        <ExercisesTab
          exercises={exercises}
          muscleGroups={muscleGroups}
          equipment={equipment}
        />
      )}
      {activeTab === "cardio" && (
        <CardioStretchingTab
          cardioStretching={cardioStretching}
          equipment={equipment}
        />
      )}
    </div>
  );
};

export default SettingsPageClient;
