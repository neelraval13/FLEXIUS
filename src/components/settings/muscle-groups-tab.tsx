"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MuscleGroupItem } from "@/types/settings";
import SearchInput from "@/components/settings/search-input";
import EmptyState from "@/components/settings/empty-state";
import MuscleGroupListItem from "@/components/settings/muscle-group-list-item";
import MuscleGroupForm from "@/components/settings/muscle-group-form";

interface MuscleGroupsTabProps {
  muscleGroups: MuscleGroupItem[];
}

const MuscleGroupsTab: React.FC<MuscleGroupsTabProps> = ({ muscleGroups }) => {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const majorGroups = useMemo(() => {
    const set = new Set(muscleGroups.map((mg) => mg.majorGroup));
    return Array.from(set).sort();
  }, [muscleGroups]);

  const filtered = useMemo(() => {
    if (!search.trim()) return muscleGroups;
    const q = search.toLowerCase();
    return muscleGroups.filter(
      (mg) =>
        mg.majorGroup.toLowerCase().includes(q) ||
        mg.targetMuscle.toLowerCase().includes(q),
    );
  }, [muscleGroups, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, MuscleGroupItem[]>();
    for (const mg of filtered) {
      const existing = map.get(mg.majorGroup) ?? [];
      existing.push(mg);
      map.set(mg.majorGroup, existing);
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
            placeholder="Search muscle groups..."
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
        {filtered.length} muscle{filtered.length !== 1 && "s"} in {grouped.size}{" "}
        group{grouped.size !== 1 && "s"}
      </p>

      {showAddForm && (
        <MuscleGroupForm
          existingMajorGroups={majorGroups}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState message="No muscle groups found" />
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([group, items]) => (
            <div key={group} className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </h3>
              {items.map((item) => (
                <MuscleGroupListItem
                  key={item.id}
                  item={item}
                  existingMajorGroups={majorGroups}
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

export default MuscleGroupsTab;
