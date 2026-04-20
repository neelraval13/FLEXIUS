"use client";

import type React from "react";
import type { SettingsTab } from "@/types/settings";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    <div className="overflow-x-auto pb-1 scrollbar-none">
      <ToggleGroup
        value={[activeTab]}
        onValueChange={(values) => {
          const next = values[0] as SettingsTab | undefined;
          if (next) onTabChange(next);
        }}
        className="rounded-lg"
      >
        {tabs.map(({ key, label, icon: Icon }) => (
          <ToggleGroupItem
            key={key}
            value={key}
            aria-label={label}
            className="px-3"
          >
            <Icon className="size-4" />
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default SettingsTabBar;
