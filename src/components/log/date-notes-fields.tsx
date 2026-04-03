// src/components/log/date-notes-fields.tsx
"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DateNotesFieldsProps {
  date: string;
  notes: string;
  onDateChange: (val: string) => void;
  onNotesChange: (val: string) => void;
}

const DateNotesFields: React.FC<DateNotesFieldsProps> = ({
  date,
  notes,
  onDateChange,
  onNotesChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="How did it feel? Any adjustments?"
          rows={2}
        />
      </div>
    </div>
  );
};

export default DateNotesFields;
