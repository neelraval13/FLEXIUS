"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ExerciseItem,
  MuscleGroupItem,
  EquipmentItem,
} from "@/types/settings";
import SearchInput from "@/components/settings/search-input";
import EmptyState from "@/components/settings/empty-state";
import ExerciseListItem from "@/components/settings/exercise-list-item";
import ExerciseForm from "@/components/settings/exercise-form";

interface ExercisesTabProps {
  exercises: ExerciseItem[];
  muscleGroups: MuscleGroupItem[];
  equipment: EquipmentItem[];
}

const ExercisesTab: React.FC<ExercisesTabProps> = ({
  exercises,
  muscleGroups,
  equipment,
}) => {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.targetMuscle.toLowerCase().includes(q) ||
        ex.muscleGroup.toLowerCase().includes(q),
    );
  }, [exercises, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, ExerciseItem[]>();
    for (const ex of filtered) {
      const existing = map.get(ex.muscleGroup) ?? [];
      existing.push(ex);
      map.set(ex.muscleGroup, existing);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search exercises..."
          />
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
          }}
          disabled={showAddForm}
        >
          <Plus className="mr-1 size-4" />
          Add
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} exercise{filtered.length !== 1 && "s"} in{" "}
        {grouped.size} group{grouped.size !== 1 && "s"}
      </p>

      {showAddForm && (
        <ExerciseForm
          muscleGroups={muscleGroups}
          equipment={equipment}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState message="No exercises found" />
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([group, items]) => (
            <div key={group} className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </h3>
              {items.map((item) => (
                <ExerciseListItem
                  key={item.id}
                  item={item}
                  muscleGroups={muscleGroups}
                  equipment={equipment}
                  isEditing={editingId === item.id}
                  onEdit={() => {
                    setEditingId(item.id);
                    setShowAddForm(false);
                  }}
                  onCancelEdit={() => setEditingId(null)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExercisesTab;
