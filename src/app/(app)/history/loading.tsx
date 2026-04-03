import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HistoryLoading() {
  return (
    <div className="space-y-4 p-4 pb-6">
      {/* Title + actions */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* View toggle */}
      <Skeleton className="h-9 w-48 rounded-md" />

      {/* Calendar grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="mx-auto h-4 w-8" />
            ))}
          </div>
          {/* Day cells (5 rows) */}
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, col) => (
                <Skeleton
                  key={col}
                  className="mx-auto my-0.5 h-9 w-9 rounded-md"
                />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Selected day card */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
