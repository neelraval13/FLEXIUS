"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmButtonProps {
  onDelete: () => Promise<void>;
}

const DeleteConfirmButton: React.FC<DeleteConfirmButtonProps> = ({
  onDelete,
}) => {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onDelete();
      setConfirming(false);
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="destructive"
          size="icon"
          className="size-7"
          onClick={handleConfirm}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:text-destructive"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
};

export default DeleteConfirmButton;
