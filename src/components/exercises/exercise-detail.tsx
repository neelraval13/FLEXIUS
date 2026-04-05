"use client";

import type React from "react";
import BackButton from "@/components/exercises/back-button";
import DifficultyBadge from "@/components/exercises/difficulty-badge";
import ExerciseInfoSection from "@/components/exercises/exercise-info-section";
import AlternativesSection from "@/components/exercises/alternatives-section";
import VideoEmbed from "@/components/exercises/video-embed";
import HistoryChart from "@/components/exercises/history-chart";
import type { WorkoutLogEntry } from "@/components/exercises/history-chart";
import HistoryList from "@/components/exercises/history-list";
import PRCard from "@/components/exercises/pr-card";

export interface ExerciseDetailData {
  id: number;
  name: string;
  targetMuscle: string;
  muscleGroupOrCategory: string;
  groupLabel: string;
  difficulty: string;
  equipment: string[];
  alternatives: string[];
  videoUrl: string | null;
  source: "exercise" | "cardio_stretching";
}

interface ExerciseDetailProps {
  exercise: ExerciseDetailData;
  logs: WorkoutLogEntry[];
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise, logs }) => {
  const isCardio = exercise.source === "cardio_stretching";

  return (
    <div className="space-y-4 pb-6">
      <BackButton />

      <div>
        <h1 className="text-2xl font-bold">{exercise.name}</h1>
        <div className="mt-1 flex items-center gap-2">
          <DifficultyBadge difficulty={exercise.difficulty} />
          <span className="text-muted-foreground text-sm">
            {exercise.targetMuscle}
          </span>
        </div>
      </div>

      <VideoEmbed videoUrl={exercise.videoUrl} />

      <ExerciseInfoSection
        targetMuscle={exercise.targetMuscle}
        muscleGroupOrCategory={exercise.muscleGroupOrCategory}
        groupLabel={exercise.groupLabel}
        difficulty={exercise.difficulty}
        equipment={exercise.equipment}
      />

      <AlternativesSection alternatives={exercise.alternatives} />

      <PRCard logs={logs} isCardio={isCardio} />

      <HistoryChart logs={logs} isCardio={isCardio} />

      <HistoryList logs={logs} isCardio={isCardio} />
    </div>
  );
};

export default ExerciseDetail;
