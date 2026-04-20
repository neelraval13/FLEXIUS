// src/components/log/log-mode-toggle.tsx
"use client";

import type React from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface LogModeToggleProps {
  mode: "summary" | "per-set";
  onModeChange: (mode: "summary" | "per-set") => void;
}

const LogModeToggle: React.FC<LogModeToggleProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <ToggleGroup
      value={[mode]}
      onValueChange={(values) => {
        const next = values[0] as "summary" | "per-set" | undefined;
        if (next) onModeChange(next);
      }}
      className="w-full"
    >
      <ToggleGroupItem
        value="summary"
        aria-label="Summary mode"
        className="flex-1"
      >
        Summary
      </ToggleGroupItem>
      <ToggleGroupItem
        value="per-set"
        aria-label="Per-set mode"
        className="flex-1"
      >
        Per Set
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default LogModeToggle;
