// src/lib/plan-cache.ts

import type { TodayPlanData } from "@/types/workout-plan";

const DB_NAME = "flexius-offline";
const STORE_NAME = "plan-cache";
const DB_VERSION = 2;
const PLAN_KEY = "today-plan";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("pending-logs")) {
        db.createObjectStore("pending-logs", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const cacheTodayPlan = async (plan: TodayPlanData): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ plan, cachedAt: Date.now() }, PLAN_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getCachedPlan = async (): Promise<TodayPlanData | null> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(PLAN_KEY);
    request.onsuccess = () => {
      const result = request.result;
      if (!result?.plan) {
        resolve(null);
        return;
      }

      // Only return if cached today (IST)
      const cachedDate = new Date(result.cachedAt).toLocaleDateString("en-CA", {
        timeZone: "Asia/Calcutta",
      });
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Calcutta",
      });

      if (cachedDate === today) {
        resolve(result.plan);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};
