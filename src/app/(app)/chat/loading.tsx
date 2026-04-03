import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Message area */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-56" />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  );
}
