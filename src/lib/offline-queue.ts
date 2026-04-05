// src/lib/offline-queue.ts

export interface PendingLog {
  id: string;
  exerciseId: number;
  exerciseSource: "exercise" | "cardio_stretching";
  performedAt: string;
  sets: number;
  reps: number;
  weight: number | null;
  unit: "kg" | "lbs" | null;
  durationMinutes: number | null;
  notes: string | null;
  queuedAt: number;
}

const DB_NAME = "flexius-offline";
const STORE_NAME = "pending-logs";
const DB_VERSION = 2;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("plan-cache")) {
        db.createObjectStore("plan-cache");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const queueLog = async (
  log: Omit<PendingLog, "id" | "queuedAt">,
): Promise<string> => {
  const db = await openDB();
  const id = crypto.randomUUID();
  const entry: PendingLog = { ...log, id, queuedAt: Date.now() };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(entry);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  });
};

export const getPendingLogs = async (): Promise<PendingLog[]> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const removePendingLog = async (id: string): Promise<void> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getPendingCount = async (): Promise<number> => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
