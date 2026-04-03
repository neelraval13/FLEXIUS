"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EquipmentItem } from "@/types/settings";
import { updateEquipment, deleteEquipment } from "@/app/actions";
import DeleteConfirmButton from "@/components/settings/delete-confirm-button";

interface EquipmentListItemProps {
  item: EquipmentItem;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
}

const EquipmentListItem: React.FC<EquipmentListItemProps> = ({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
}) => {
  const [name, setName] = useState(item.name);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Name is required");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await updateEquipment(item.id, { name: trimmed });
        onCancelEdit();
      } catch {
        setError("Failed to update");
      }
    });
  };

  const handleDelete = async () => {
    await deleteEquipment(item.id);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="flex items-start gap-2 rounded-lg border border-primary/30 bg-muted/50 p-3"
      >
        <div className="flex-1 space-y-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={isPending}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button type="submit" size="sm" disabled={isPending || !name.trim()}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setName(item.name);
            setError("");
            onCancelEdit();
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
      <span className="flex-1 text-sm">{item.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-foreground"
        onClick={onEdit}
      >
        <Pencil className="size-3.5" />
      </Button>
      <DeleteConfirmButton onDelete={handleDelete} />
    </div>
  );
};

export default EquipmentListItem;
