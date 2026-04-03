"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEquipment } from "@/app/actions";

interface EquipmentFormProps {
  onClose: () => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Name is required");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await createEquipment({ name: trimmed });
        onClose();
      } catch {
        setError("Failed to add equipment");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3"
    >
      <div className="flex-1 space-y-1">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Equipment name"
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
        onClick={onClose}
        disabled={isPending}
      >
        Cancel
      </Button>
    </form>
  );
};

export default EquipmentForm;
