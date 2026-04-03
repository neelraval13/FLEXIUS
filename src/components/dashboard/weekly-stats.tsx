import type React from "react";
import { Calendar, Dumbbell, Layers, Weight } from "lucide-react";
import type { WeeklyStats as WeeklyStatsType } from "@/types/dashboard";
import StatCard from "./stat-card";

interface WeeklyStatsProps {
  stats: WeeklyStatsType;
}

const formatVolume = (vol: number): string => {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k kg`;
  return `${vol} kg`;
};

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={Calendar}
        label="Days Active"
        value={`${stats.workoutDays}/7`}
      />
      <StatCard
        icon={Dumbbell}
        label="Exercises"
        value={stats.totalExercises}
      />
      <StatCard icon={Layers} label="Total Sets" value={stats.totalSets} />
      <StatCard
        icon={Weight}
        label="Volume"
        value={formatVolume(stats.totalVolume)}
      />
    </div>
  );
};

export default WeeklyStats;
