"use client";

import type React from "react";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteWorkoutLog } from "@/app/actions";

interface DeleteLogButtonProps {
  logId: number;
}

const DeleteLogButton: React.FC<DeleteLogButtonProps> = ({ logId }) => {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteWorkoutLog(logId);
      setConfirming(false);
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="h-7 px-2 text-xs"
        >
          {isPending ? "Deleting…" : "Confirm"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="h-7 px-2 text-xs"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setConfirming(true)}
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
};

export default DeleteLogButton;
