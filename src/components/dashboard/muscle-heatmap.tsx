// src/components/dashboard/muscle-heatmap.tsx
"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MuscleHeatmapData } from "@/db/queries/muscle-heatmap";

interface MuscleHeatmapProps {
  data: MuscleHeatmapData;
}

const MUSCLE_GROUPS = [
  { key: "Shoulders", label: "Shoulders" },
  { key: "Chest", label: "Chest" },
  { key: "Back", label: "Back" },
  { key: "Biceps", label: "Biceps" },
  { key: "Triceps", label: "Triceps" },
  { key: "Core", label: "Core" },
  { key: "Legs", label: "Legs" },
  { key: "Cardio", label: "Cardio" },
];

const getIntensity = (
  sets: number,
): { color: string; bg: string; level: string } => {
  if (sets === 0)
    return { color: "text-muted-foreground/40", bg: "bg-muted/30", level: "—" };
  if (sets <= 4)
    return { color: "text-sky-400", bg: "bg-sky-500/15", level: "Light" };
  if (sets <= 10)
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/15",
      level: "Moderate",
    };
  if (sets <= 18)
    return { color: "text-amber-400", bg: "bg-amber-500/15", level: "Strong" };
  return { color: "text-red-400", bg: "bg-red-500/15", level: "Heavy" };
};

// Fill color for SVG regions based on set count
const getFill = (sets: number): string => {
  if (sets === 0) return "rgba(136,145,165,0.08)";
  if (sets <= 4) return "rgba(56,189,248,0.25)";
  if (sets <= 10) return "rgba(52,211,153,0.35)";
  if (sets <= 18) return "rgba(251,191,36,0.4)";
  return "rgba(248,113,113,0.45)";
};

const getStroke = (sets: number): string => {
  if (sets === 0) return "rgba(136,145,165,0.15)";
  if (sets <= 4) return "rgba(56,189,248,0.5)";
  if (sets <= 10) return "rgba(52,211,153,0.6)";
  if (sets <= 18) return "rgba(251,191,36,0.6)";
  return "rgba(248,113,113,0.7)";
};

const BodyMapSVG: React.FC<{ data: MuscleHeatmapData }> = ({ data }) => {
  const s = (key: string) => data[key] ?? 0;

  return (
    <svg viewBox="0 0 200 340" className="mx-auto h-56 w-auto">
      {/* Head */}
      <ellipse
        cx="100"
        cy="28"
        rx="18"
        ry="22"
        fill="rgba(136,145,165,0.1)"
        stroke="rgba(136,145,165,0.2)"
        strokeWidth="1"
      />

      {/* Neck */}
      <rect
        x="92"
        y="48"
        width="16"
        height="14"
        rx="4"
        fill="rgba(136,145,165,0.08)"
        stroke="rgba(136,145,165,0.15)"
        strokeWidth="0.8"
      />

      {/* Shoulders */}
      <path
        d="M68 62 Q58 64 50 78 L68 78 Z"
        fill={getFill(s("Shoulders"))}
        stroke={getStroke(s("Shoulders"))}
        strokeWidth="1"
      />
      <path
        d="M132 62 Q142 64 150 78 L132 78 Z"
        fill={getFill(s("Shoulders"))}
        stroke={getStroke(s("Shoulders"))}
        strokeWidth="1"
      />

      {/* Chest */}
      <path
        d="M68 78 L68 118 Q84 126 100 126 Q116 126 132 118 L132 78 L108 66 L92 66 Z"
        fill={getFill(s("Chest"))}
        stroke={getStroke(s("Chest"))}
        strokeWidth="1"
      />

      {/* Back indicator (hatched bar behind chest) */}
      <rect
        x="72"
        y="68"
        width="56"
        height="6"
        rx="2"
        fill={getFill(s("Back"))}
        stroke={getStroke(s("Back"))}
        strokeWidth="0.8"
        opacity="0.8"
      />

      {/* Biceps */}
      <path
        d="M50 78 L42 110 Q40 120 44 130 L56 130 Q60 118 58 108 L68 78 Z"
        fill={getFill(s("Biceps"))}
        stroke={getStroke(s("Biceps"))}
        strokeWidth="1"
      />
      <path
        d="M150 78 L158 110 Q160 120 156 130 L144 130 Q140 118 142 108 L132 78 Z"
        fill={getFill(s("Biceps"))}
        stroke={getStroke(s("Biceps"))}
        strokeWidth="1"
      />

      {/* Triceps (back of arm, shown as inner strip) */}
      <path
        d="M56 130 L52 158 Q54 164 58 164 L62 164 Q64 158 62 130 Z"
        fill={getFill(s("Triceps"))}
        stroke={getStroke(s("Triceps"))}
        strokeWidth="0.8"
      />
      <path
        d="M144 130 L148 158 Q146 164 142 164 L138 164 Q136 158 138 130 Z"
        fill={getFill(s("Triceps"))}
        stroke={getStroke(s("Triceps"))}
        strokeWidth="0.8"
      />

      {/* Forearms */}
      <path
        d="M44 130 L38 170 Q40 174 44 174 L52 130 Z"
        fill="rgba(136,145,165,0.08)"
        stroke="rgba(136,145,165,0.15)"
        strokeWidth="0.8"
      />
      <path
        d="M156 130 L162 170 Q160 174 156 174 L148 130 Z"
        fill="rgba(136,145,165,0.08)"
        stroke="rgba(136,145,165,0.15)"
        strokeWidth="0.8"
      />

      {/* Core / Abs */}
      <path
        d="M78 126 L78 190 Q88 196 100 196 Q112 196 122 190 L122 126 Q116 126 100 126 Q84 126 78 126 Z"
        fill={getFill(s("Core"))}
        stroke={getStroke(s("Core"))}
        strokeWidth="1"
      />
      {/* Ab lines */}
      {s("Core") > 0 && (
        <>
          <line
            x1="100"
            y1="130"
            x2="100"
            y2="186"
            stroke={getStroke(s("Core"))}
            strokeWidth="0.5"
            opacity="0.4"
          />
          <line
            x1="82"
            y1="142"
            x2="118"
            y2="142"
            stroke={getStroke(s("Core"))}
            strokeWidth="0.4"
            opacity="0.3"
          />
          <line
            x1="82"
            y1="158"
            x2="118"
            y2="158"
            stroke={getStroke(s("Core"))}
            strokeWidth="0.4"
            opacity="0.3"
          />
          <line
            x1="84"
            y1="174"
            x2="116"
            y2="174"
            stroke={getStroke(s("Core"))}
            strokeWidth="0.4"
            opacity="0.3"
          />
        </>
      )}

      {/* Legs — Quads */}
      <path
        d="M78 196 L72 280 Q78 290 90 290 L90 200 Q86 196 78 196 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="1"
      />
      <path
        d="M122 196 L128 280 Q122 290 110 290 L110 200 Q114 196 122 196 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="1"
      />

      {/* Calves */}
      <path
        d="M74 290 L72 326 Q76 332 84 332 L88 290 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="0.8"
        opacity="0.8"
      />
      <path
        d="M126 290 L128 326 Q124 332 116 332 L112 290 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="0.8"
        opacity="0.8"
      />

      {/* Labels for active groups */}
      {s("Shoulders") > 0 && (
        <text
          x="36"
          y="70"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="end"
        >
          Shoulders
        </text>
      )}
      {s("Chest") > 0 && (
        <text
          x="100"
          y="100"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Chest
        </text>
      )}
      {s("Back") > 0 && (
        <text x="165" y="72" fontSize="7" fill="rgba(156,163,175,0.7)">
          Back
        </text>
      )}
      {s("Biceps") > 0 && (
        <text
          x="32"
          y="120"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="end"
        >
          Biceps
        </text>
      )}
      {s("Core") > 0 && (
        <text
          x="100"
          y="166"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Core
        </text>
      )}
      {s("Legs") > 0 && (
        <text
          x="100"
          y="250"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Legs
        </text>
      )}
    </svg>
  );
};

const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ data }) => {
  const totalGroups = MUSCLE_GROUPS.filter((g) => g.key !== "Cardio").length;
  const hitGroups = MUSCLE_GROUPS.filter(
    (g) => g.key !== "Cardio" && (data[g.key] ?? 0) > 0,
  ).length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Muscle Map</CardTitle>
          <span className="text-xs text-muted-foreground">
            {hitGroups}/{totalGroups} groups
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <BodyMapSVG data={data} />

        {/* Legend grid */}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {MUSCLE_GROUPS.map(({ key, label }) => {
            const sets = data[key] ?? 0;
            const { color, bg, level } = getIntensity(sets);

            return (
              <div
                key={key}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${bg}`}
              >
                <span className={`text-xs font-medium ${color}`}>{label}</span>
                <span className={`text-[10px] ${color}`}>
                  {sets > 0 ? `${sets} sets` : level}
                </span>
              </div>
            );
          })}
        </div>

        {/* Intensity legend */}
        <div className="mt-2.5 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted" /> None
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400/50" /> Light
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400/50" /> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400/50" /> Strong
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400/50" /> Heavy
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MuscleHeatmap;
