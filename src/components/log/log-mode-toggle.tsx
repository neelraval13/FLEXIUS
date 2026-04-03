// src/components/log/log-mode-toggle.tsx
"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LogModeToggleProps {
  mode: "summary" | "per-set";
  onModeChange: (mode: "summary" | "per-set") => void;
}

const LogModeToggle: React.FC<LogModeToggleProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "flex-1 text-xs",
          mode === "summary" && "bg-background shadow-sm hover:bg-background",
        )}
        onClick={() => onModeChange("summary")}
      >
        Summary
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "flex-1 text-xs",
          mode === "per-set" && "bg-background shadow-sm hover:bg-background",
        )}
        onClick={() => onModeChange("per-set")}
      >
        Per Set
      </Button>
    </div>
  );
};

export default LogModeToggle;
