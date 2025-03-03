"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AttendanceType } from "@/types/attendance";

export default function SelectAttendanceTypeButton({ value, onClick }: { value: string; onClick: (attendanceType: AttendanceType) => void }) {
  return (
    <Select value={value} onValueChange={onClick}>
      <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Attendance Type" />
      </SelectTrigger>
      <SelectContent className="font-medium">
        <SelectItem value="CLOCK_IN">Clock-in</SelectItem>
        <SelectItem value="CLOCK_OUT">Clock-out</SelectItem>
      </SelectContent>
    </Select>
  );
}
