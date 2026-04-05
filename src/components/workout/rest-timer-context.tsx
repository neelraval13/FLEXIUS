// src/components/workout/rest-timer-context.tsx
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";

interface RestTimerState {
  isActive: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  exerciseName: string;
}

interface RestTimerContextValue {
  timer: RestTimerState;
  startTimer: (seconds: number, exerciseName: string) => void;
  stopTimer: () => void;
  addTime: (seconds: number) => void;
}

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

export const useRestTimer = (): RestTimerContextValue => {
  const ctx = useContext(RestTimerContext);
  if (!ctx)
    throw new Error("useRestTimer must be used within RestTimerProvider");
  return ctx;
};

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [timer, setTimer] = useState<RestTimerState>({
    isActive: false,
    totalSeconds: 0,
    remainingSeconds: 0,
    exerciseName: "",
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    clearTimer();
    setTimer({
      isActive: false,
      totalSeconds: 0,
      remainingSeconds: 0,
      exerciseName: "",
    });
  }, [clearTimer]);

  const startTimer = useCallback(
    (seconds: number, exerciseName: string) => {
      clearTimer();

      setTimer({
        isActive: true,
        totalSeconds: seconds,
        remainingSeconds: seconds,
        exerciseName,
      });

      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev.remainingSeconds <= 1) {
            clearTimer();

            // Haptic feedback — long vibration pattern
            if ("vibrate" in navigator) {
              navigator.vibrate([200, 100, 200, 100, 300]);
            }

            return { ...prev, remainingSeconds: 0 };
          }

          // Short tick vibration at 10s, 5s, 3s, 2s, 1s
          const next = prev.remainingSeconds - 1;
          if (
            "vibrate" in navigator &&
            (next === 10 || next === 5 || next <= 3)
          ) {
            navigator.vibrate(50);
          }

          return { ...prev, remainingSeconds: next };
        });
      }, 1000);
    },
    [clearTimer],
  );

  const addTime = useCallback(
    (seconds: number) => {
      setTimer((prev) => {
        if (!prev.isActive && prev.remainingSeconds === 0) return prev;

        const newRemaining = prev.remainingSeconds + seconds;
        const newTotal = prev.totalSeconds + seconds;

        // Restart interval if timer had finished
        if (prev.remainingSeconds === 0 && newRemaining > 0) {
          clearTimer();
          intervalRef.current = setInterval(() => {
            setTimer((p) => {
              if (p.remainingSeconds <= 1) {
                clearTimer();
                if ("vibrate" in navigator) {
                  navigator.vibrate([200, 100, 200, 100, 300]);
                }
                return { ...p, remainingSeconds: 0 };
              }
              const n = p.remainingSeconds - 1;
              if ("vibrate" in navigator && (n === 10 || n === 5 || n <= 3)) {
                navigator.vibrate(50);
              }
              return { ...p, remainingSeconds: n };
            });
          }, 1000);
        }

        return {
          ...prev,
          isActive: true,
          totalSeconds: newTotal,
          remainingSeconds: newRemaining,
        };
      });
    },
    [clearTimer],
  );

  return (
    <RestTimerContext.Provider
      value={{ timer, startTimer, stopTimer, addTime }}
    >
      {children}
    </RestTimerContext.Provider>
  );
};
