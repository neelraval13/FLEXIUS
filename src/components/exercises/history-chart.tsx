"use client";

import type React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface WorkoutLogEntry {
  id: number;
  performedAt: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  unit: string | null;
  durationMinutes: number | null;
  notes: string | null;
}

interface HistoryChartProps {
  logs: WorkoutLogEntry[];
  isCardio: boolean;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ logs, isCardio }) => {
  if (logs.length < 2) return null;

  const sorted = [...logs].sort(
    (a, b) =>
      new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime(),
  );

  const chartData = sorted.map((log) => ({
    date: new Date(log.performedAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    value: isCardio ? (log.durationMinutes ?? 0) : (log.weight ?? 0),
  }));

  const label = isCardio
    ? "Duration (min)"
    : `Weight (${sorted[0]?.unit ?? "kg"})`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3 text-xs">{label}</p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryChart;
