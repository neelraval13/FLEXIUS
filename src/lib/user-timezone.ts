// src/lib/user-timezone.ts

/**
 * Get today's date string (YYYY-MM-DD) for a given timezone.
 */
export const getTodayForTimezone = (timezone: string): string => {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
};

/**
 * Get a Date object representing "now" in the given timezone.
 * Useful for calculating weekday, hour-of-day, etc.
 */
export const getNowForTimezone = (timezone: string): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
};

/**
 * Get the Monday–Sunday date range for a given week offset.
 * weeksAgo = 0 → this week, weeksAgo = 1 → last week.
 */
export const getWeekRangeForTimezone = (
  timezone: string,
  weeksAgo: number = 0,
): { start: string; end: string } => {
  const now = getNowForTimezone(timezone);
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) - weeksAgo * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
};

/** Default timezone for cases where profile hasn't been loaded yet */
export const DEFAULT_TIMEZONE = "Asia/Kolkata";
