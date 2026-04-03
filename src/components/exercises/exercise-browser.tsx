"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchBar from "./search-bar";
import MuscleGroupFilter from "./muscle-group-filter";
import ExerciseGrid from "./exercise-grid";
import EmptyState from "./empty-state";
import type { ExerciseCardData } from "./exercise-card";

interface ExerciseBrowserProps {
  exercises: ExerciseCardData[];
  cardioStretching: ExerciseCardData[];
  muscleGroups: string[];
  cardioCategories: string[];
}

const filterExercises = (
  items: ExerciseCardData[],
  search: string,
  group: string,
  groupKey: "muscleGroup" | "category",
): ExerciseCardData[] => {
  let result = items;

  if (group !== "All") {
    result = result.filter((item) =>
      groupKey === "muscleGroup"
        ? item.muscleGroup === group
        : item.category === group,
    );
  }

  if (search.trim()) {
    const query = search.toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.targetMuscle.toLowerCase().includes(query),
    );
  }

  return result;
};

const ExerciseBrowser: React.FC<ExerciseBrowserProps> = ({
  exercises,
  cardioStretching,
  muscleGroups,
  cardioCategories,
}) => {
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [cardioSearch, setCardioSearch] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredExercises = useMemo(
    () =>
      filterExercises(
        exercises,
        exerciseSearch,
        selectedMuscleGroup,
        "muscleGroup",
      ),
    [exercises, exerciseSearch, selectedMuscleGroup],
  );

  const filteredCardio = useMemo(
    () =>
      filterExercises(
        cardioStretching,
        cardioSearch,
        selectedCategory,
        "category",
      ),
    [cardioStretching, cardioSearch, selectedCategory],
  );

  return (
    <Tabs defaultValue="exercises" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="exercises">
          Exercises ({filteredExercises.length})
        </TabsTrigger>
        <TabsTrigger value="cardio">
          Cardio & More ({filteredCardio.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="exercises" className="space-y-4">
        <SearchBar
          value={exerciseSearch}
          onChange={setExerciseSearch}
          placeholder="Search exercises..."
        />
        <MuscleGroupFilter
          groups={muscleGroups}
          selected={selectedMuscleGroup}
          onSelect={setSelectedMuscleGroup}
        />
        {filteredExercises.length > 0 ? (
          <ExerciseGrid exercises={filteredExercises} />
        ) : (
          <EmptyState message="No exercises match your filters." />
        )}
      </TabsContent>

      <TabsContent value="cardio" className="space-y-4">
        <SearchBar
          value={cardioSearch}
          onChange={setCardioSearch}
          placeholder="Search cardio & stretching..."
        />
        <MuscleGroupFilter
          groups={cardioCategories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {filteredCardio.length > 0 ? (
          <ExerciseGrid exercises={filteredCardio} />
        ) : (
          <EmptyState message="No entries match your filters." />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ExerciseBrowser;
