import type React from "react";
import { Calendar, Weight, Repeat, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutLogEntry } from "@/components/exercises/history-chart";

interface HistoryListProps {
  logs: WorkoutLogEntry[];
  isCardio: boolean;
}

const HistoryList: React.FC<HistoryListProps> = ({ logs, isCardio }) => {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No workout logs yet. Start tracking to see your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...logs].sort(
    (a, b) =>
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          History
          <span className="text-muted-foreground text-xs font-normal">
            ({logs.length} {logs.length === 1 ? "entry" : "entries"})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((log) => (
            <div
              key={log.id}
              className="bg-muted/50 flex items-start justify-between rounded-lg p-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {new Date(log.performedAt).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                  {!isCardio && log.sets != null && (
                    <span className="flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      {log.sets} × {log.reps ?? "—"}
                    </span>
                  )}
                  {!isCardio && log.weight != null && (
                    <span className="flex items-center gap-1">
                      <Weight className="h-3 w-3" />
                      {log.weight} {log.unit ?? "kg"}
                    </span>
                  )}
                  {isCardio && log.durationMinutes != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {log.durationMinutes} min
                    </span>
                  )}
                </div>
                {log.notes && (
                  <p className="text-muted-foreground text-xs italic">
                    {log.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryList;
