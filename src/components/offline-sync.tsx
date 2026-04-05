// src/components/offline-sync.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { WifiOff, Check, Loader2 } from "lucide-react";
import {
  getPendingLogs,
  removePendingLog,
  getPendingCount,
} from "@/lib/offline-queue";

type SyncState = "idle" | "offline" | "syncing" | "synced";

const OfflineSync: React.FC = () => {
  const [state, setState] = useState<SyncState>("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const syncingRef = useRef(false);

  const checkPending = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      // IndexedDB not available
    }
  }, []);

  const syncLogs = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    try {
      const pending = await getPendingLogs();
      if (pending.length === 0) {
        syncingRef.current = false;
        return;
      }

      setState("syncing");

      const response = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: pending.map(({ ...log }) => log),
        }),
      });

      if (response.ok) {
        // Remove synced entries from IndexedDB
        for (const entry of pending) {
          await removePendingLog(entry.id);
        }

        setSyncedCount(pending.length);
        setPendingCount(0);
        setState("synced");

        // Clear success state after 4 seconds
        setTimeout(() => {
          setState("idle");
          setSyncedCount(0);
        }, 4000);
      } else {
        // Sync failed — stay in offline state, will retry
        setState("offline");
      }
    } catch {
      setState("offline");
    } finally {
      syncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Check for pending logs on mount
    checkPending();

    // Set initial online/offline state
    if (!navigator.onLine) {
      setState("offline");
    }

    const handleOnline = () => {
      setState("idle");
      syncLogs();
    };

    const handleOffline = () => {
      setState("offline");
    };

    // Listen for queue updates from the form
    const handleQueued = () => {
      checkPending();
      setState("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("workout-queued", handleQueued);

    // Try to sync on mount if online and has pending
    if (navigator.onLine) {
      syncLogs();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("workout-queued", handleQueued);
    };
  }, [checkPending, syncLogs]);

  // Nothing to show
  if (state === "idle" && pendingCount === 0) return null;

  return (
    <div className="fixed left-4 right-4 top-18 z-90 mx-auto max-w-sm">
      {state === "offline" && pendingCount > 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="text-amber-200">
            {pendingCount} workout{pendingCount > 1 ? "s" : ""} queued — will
            sync when back online
          </span>
        </div>
      )}

      {state === "offline" && pendingCount === 0 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="text-amber-200">You&apos;re offline</span>
        </div>
      )}

      {state === "syncing" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <span className="text-foreground">Syncing workouts...</span>
        </div>
      )}

      {state === "synced" && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm">
          <Check className="h-4 w-4 shrink-0 text-emerald-500" />
          <span className="text-emerald-200">
            {syncedCount} workout{syncedCount > 1 ? "s" : ""} synced
            successfully
          </span>
        </div>
      )}
    </div>
  );
};

export default OfflineSync;
