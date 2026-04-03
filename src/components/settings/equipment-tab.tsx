"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EquipmentItem } from "@/types/settings";
import SearchInput from "@/components/settings/search-input";
import EmptyState from "@/components/settings/empty-state";
import EquipmentListItem from "@/components/settings/equipment-list-item";
import EquipmentForm from "@/components/settings/equipment-form";

interface EquipmentTabProps {
  equipment: EquipmentItem[];
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ equipment }) => {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return equipment;
    const q = search.toLowerCase();
    return equipment.filter((e) => e.name.toLowerCase().includes(q));
  }, [equipment, search]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search equipment..."
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
        {filtered.length} item{filtered.length !== 1 && "s"}
      </p>

      {showAddForm && <EquipmentForm onClose={() => setShowAddForm(false)} />}

      {filtered.length === 0 ? (
        <EmptyState message="No equipment found" />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <EquipmentListItem
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              onEdit={() => {
                setEditingId(item.id);
                setShowAddForm(false);
              }}
              onCancelEdit={() => setEditingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentTab;
