// src/components/dashboard/muscle-heatmap.tsx
"use client";

import type React from "react";
import { useState } from "react";
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

// ─── SVG Fill & Stroke based on intensity ─────────────────

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

const inactiveF = "rgba(136,145,165,0.08)";
const inactiveS = "rgba(136,145,165,0.15)";

// ─── Front View SVG ───────────────────────────────────────

const FrontBodySVG: React.FC<{ data: MuscleHeatmapData }> = ({ data }) => {
  const s = (key: string) => data[key] ?? 0;

  return (
    <svg viewBox="0 0 200 340" className="mx-auto h-56 w-auto">
      {/* Head */}
      <ellipse
        cx="100"
        cy="28"
        rx="18"
        ry="22"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="1"
      />

      {/* Neck */}
      <rect
        x="92"
        y="48"
        width="16"
        height="14"
        rx="4"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />

      {/* Shoulders (front delts) */}
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
      {/* Pec line */}
      {s("Chest") > 0 && (
        <line
          x1="100"
          y1="78"
          x2="100"
          y2="118"
          stroke={getStroke(s("Chest"))}
          strokeWidth="0.5"
          opacity="0.3"
        />
      )}

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

      {/* Forearms */}
      <path
        d="M44 130 L38 170 Q40 174 44 174 L52 130 Z"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />
      <path
        d="M156 130 L162 170 Q160 174 156 174 L148 130 Z"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />

      {/* Core / Abs */}
      <path
        d="M78 126 L78 190 Q88 196 100 196 Q112 196 122 190 L122 126 Q116 126 100 126 Q84 126 78 126 Z"
        fill={getFill(s("Core"))}
        stroke={getStroke(s("Core"))}
        strokeWidth="1"
      />
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

      {/* Quads */}
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

      {/* Shins */}
      <path
        d="M74 290 L72 326 Q76 332 84 332 L88 290 Z"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />
      <path
        d="M126 290 L128 326 Q124 332 116 332 L112 290 Z"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />

      {/* Labels */}
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
          Quads
        </text>
      )}
    </svg>
  );
};

// ─── Back View SVG ────────────────────────────────────────

const BackBodySVG: React.FC<{ data: MuscleHeatmapData }> = ({ data }) => {
  const s = (key: string) => data[key] ?? 0;

  return (
    <svg viewBox="0 0 200 340" className="mx-auto h-56 w-auto">
      {/* Head */}
      <ellipse
        cx="100"
        cy="28"
        rx="18"
        ry="22"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="1"
      />

      {/* Neck */}
      <rect
        x="92"
        y="48"
        width="16"
        height="14"
        rx="4"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />

      {/* Shoulders (rear delts) */}
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

      {/* Traps */}
      <path
        d="M78 60 L92 66 L100 62 L108 66 L122 60 L122 78 L78 78 Z"
        fill={getFill(s("Back"))}
        stroke={getStroke(s("Back"))}
        strokeWidth="0.8"
      />

      {/* Lats + Upper back */}
      <path
        d="M68 78 L68 130 Q76 140 86 142 L86 118 Q84 100 78 90 Z"
        fill={getFill(s("Back"))}
        stroke={getStroke(s("Back"))}
        strokeWidth="1"
      />
      <path
        d="M132 78 L132 130 Q124 140 114 142 L114 118 Q116 100 122 90 Z"
        fill={getFill(s("Back"))}
        stroke={getStroke(s("Back"))}
        strokeWidth="1"
      />

      {/* Mid back (spinal erectors) */}
      <path
        d="M86 90 L86 142 Q92 148 100 148 Q108 148 114 142 L114 90 Q108 84 100 84 Q92 84 86 90 Z"
        fill={getFill(s("Back"))}
        stroke={getStroke(s("Back"))}
        strokeWidth="1"
      />
      {/* Spine line */}
      {s("Back") > 0 && (
        <line
          x1="100"
          y1="78"
          x2="100"
          y2="145"
          stroke={getStroke(s("Back"))}
          strokeWidth="0.6"
          opacity="0.3"
        />
      )}

      {/* Triceps */}
      <path
        d="M50 78 L42 110 Q40 120 44 130 L56 130 Q60 118 58 108 L68 78 Z"
        fill={getFill(s("Triceps"))}
        stroke={getStroke(s("Triceps"))}
        strokeWidth="1"
      />
      <path
        d="M150 78 L158 110 Q160 120 156 130 L144 130 Q140 118 142 108 L132 78 Z"
        fill={getFill(s("Triceps"))}
        stroke={getStroke(s("Triceps"))}
        strokeWidth="1"
      />

      {/* Forearms */}
      <path
        d="M44 130 L38 170 Q40 174 44 174 L52 130 Z"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />
      <path
        d="M156 130 L162 170 Q160 174 156 174 L148 130 Z"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.8"
      />

      {/* Lower back */}
      <path
        d="M78 148 L78 190 Q88 196 100 196 Q112 196 122 190 L122 148 Q112 152 100 152 Q88 152 78 148 Z"
        fill={getFill(s("Back"))}
        stroke={getStroke(s("Back"))}
        strokeWidth="1"
        opacity="0.8"
      />

      {/* Glutes */}
      <path
        d="M78 190 Q78 210 90 214 L90 196 Q86 194 78 190 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="1"
      />
      <path
        d="M122 190 Q122 210 110 214 L110 196 Q114 194 122 190 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="1"
      />
      {/* Glute division line */}
      <line
        x1="100"
        y1="192"
        x2="100"
        y2="216"
        stroke={getStroke(s("Legs"))}
        strokeWidth="0.4"
        opacity="0.3"
      />

      {/* Hamstrings */}
      <path
        d="M78 214 L72 280 Q78 290 90 290 L90 214 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="1"
      />
      <path
        d="M122 214 L128 280 Q122 290 110 290 L110 214 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="1"
      />

      {/* Calves */}
      <path
        d="M74 290 L70 310 Q74 322 82 322 Q88 318 88 310 L88 290 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="0.8"
      />
      <path
        d="M126 290 L130 310 Q126 322 118 322 Q112 318 112 310 L112 290 Z"
        fill={getFill(s("Legs"))}
        stroke={getStroke(s("Legs"))}
        strokeWidth="0.8"
      />

      {/* Feet */}
      <ellipse
        cx="80"
        cy="330"
        rx="10"
        ry="4"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.6"
      />
      <ellipse
        cx="120"
        cy="330"
        rx="10"
        ry="4"
        fill={inactiveF}
        stroke={inactiveS}
        strokeWidth="0.6"
      />

      {/* Labels */}
      {s("Shoulders") > 0 && (
        <text
          x="36"
          y="70"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="end"
        >
          Rear Delts
        </text>
      )}
      {s("Back") > 0 && (
        <text
          x="100"
          y="116"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Back
        </text>
      )}
      {s("Triceps") > 0 && (
        <text x="168" y="110" fontSize="7" fill="rgba(156,163,175,0.7)">
          Triceps
        </text>
      )}
      {s("Back") > 0 && (
        <text
          x="100"
          y="172"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Lower Back
        </text>
      )}
      {s("Legs") > 0 && (
        <text
          x="100"
          y="206"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Glutes
        </text>
      )}
      {s("Legs") > 0 && (
        <text
          x="100"
          y="260"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Hamstrings
        </text>
      )}
      {s("Legs") > 0 && (
        <text
          x="100"
          y="316"
          fontSize="7"
          fill="rgba(156,163,175,0.7)"
          textAnchor="middle"
        >
          Calves
        </text>
      )}
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────

const MuscleHeatmap: React.FC<MuscleHeatmapProps> = ({ data }) => {
  const [view, setView] = useState<"front" | "back">("front");

  const totalGroups = MUSCLE_GROUPS.filter((g) => g.key !== "Cardio").length;
  const hitGroups = MUSCLE_GROUPS.filter(
    (g) => g.key !== "Cardio" && (data[g.key] ?? 0) > 0,
  ).length;

  // Determine if back-dominant muscles are trained (auto-hint)
  const hasBackMuscles = (data["Back"] ?? 0) > 0 || (data["Triceps"] ?? 0) > 0;

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
        {/* Front / Back toggle */}
        <div className="mb-3 flex items-center justify-center">
          <div className="flex rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setView("front")}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                view === "front"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setView("back")}
              className={`relative rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                view === "back"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Back
              {/* Pulse dot if back muscles are trained but user hasn't looked */}
              {hasBackMuscles && view === "front" && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Body SVG */}
        {view === "front" ? (
          <FrontBodySVG data={data} />
        ) : (
          <BackBodySVG data={data} />
        )}

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
