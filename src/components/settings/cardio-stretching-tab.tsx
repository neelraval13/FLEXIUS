"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CardioStretchingItem, EquipmentItem } from "@/types/settings";
import SearchInput from "@/components/settings/search-input";
import EmptyState from "@/components/settings/empty-state";
import CardioStretchingListItem from "@/components/settings/cardio-stretching-list-item";
import CardioStretchingForm from "@/components/settings/cardio-stretching-form";

interface CardioStretchingTabProps {
  cardioStretching: CardioStretchingItem[];
  equipment: EquipmentItem[];
}

const CATEGORY_OPTIONS = [
  "Cardio",
  "Core",
  "Obliques",
  "Stretching",
  "Stretching & Recovery",
];

const CardioStretchingTab: React.FC<CardioStretchingTabProps> = ({
  cardioStretching,
  equipment,
}) => {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return cardioStretching;
    const q = search.toLowerCase();
    return cardioStretching.filter(
      (cs) =>
        cs.name.toLowerCase().includes(q) ||
        cs.targetMuscle.toLowerCase().includes(q) ||
        cs.category.toLowerCase().includes(q),
    );
  }, [cardioStretching, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, CardioStretchingItem[]>();
    for (const cs of filtered) {
      const existing = map.get(cs.category) ?? [];
      existing.push(cs);
      map.set(cs.category, existing);
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
            placeholder="Search cardio & stretching..."
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
        {filtered.length} item{filtered.length !== 1 && "s"} in {grouped.size}{" "}
        categor{grouped.size !== 1 ? "ies" : "y"}
      </p>

      {showAddForm && (
        <CardioStretchingForm
          equipment={equipment}
          categoryOptions={CATEGORY_OPTIONS}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {filtered.length === 0 ? (
        <EmptyState message="No cardio or stretching entries found" />
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category} className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h3>
              {items.map((item) => (
                <CardioStretchingListItem
                  key={item.id}
                  item={item}
                  equipment={equipment}
                  categoryOptions={CATEGORY_OPTIONS}
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

export default CardioStretchingTab;
