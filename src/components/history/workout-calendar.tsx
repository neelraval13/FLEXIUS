"use client";

import type React from "react";
import { useState, useMemo } from "react";
import CalendarHeader from "@/components/history/calendar-header";
import DayCell from "@/components/history/day-cell";

interface WorkoutCalendarProps {
  logDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatDateString = (year: number, month: number, day: number): string => {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};

const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  logDates,
  selectedDate,
  onSelectDate,
}) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const todayString = formatDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(d);
    }

    return cells;
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {label}
          </div>
        ))}
        {days.map((day, i) => {
          const dateStr = day ? formatDateString(year, month, day) : null;
          return (
            <DayCell
              key={i}
              day={day}
              hasLogs={dateStr ? logDates.has(dateStr) : false}
              isSelected={dateStr === selectedDate}
              isToday={dateStr === todayString}
              onClick={() => {
                if (dateStr) onSelectDate(dateStr);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutCalendar;
