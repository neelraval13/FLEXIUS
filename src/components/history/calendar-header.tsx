"use client";

import type React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={onPrevMonth}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h3 className="text-sm font-semibold">
        {MONTH_NAMES[month]} {year}
      </h3>
      <Button variant="ghost" size="icon" onClick={onNextMonth}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default CalendarHeader;
