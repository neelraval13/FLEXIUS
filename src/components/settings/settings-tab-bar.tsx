"use client";

import type React from "react";
import type { SettingsTab } from "@/types/settings";
import { cn } from "@/lib/utils";

interface TabDefinition {
  key: SettingsTab;
  label: string;
  icon: React.ElementType;
}

interface SettingsTabBarProps {
  tabs: TabDefinition[];
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const SettingsTabBar: React.FC<SettingsTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            activeTab === key
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default SettingsTabBar;
