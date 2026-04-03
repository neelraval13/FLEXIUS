import type React from "react";
import ExerciseCard from "./exercise-card";
import type { ExerciseCardData } from "./exercise-card";

interface ExerciseGridProps {
  exercises: ExerciseCardData[];
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({ exercises }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={`${exercise.source}-${exercise.id}`}
          exercise={exercise}
        />
      ))}
    </div>
  );
};

export default ExerciseGrid;
