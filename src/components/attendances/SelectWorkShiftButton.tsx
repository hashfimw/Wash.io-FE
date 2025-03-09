"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { EmployeeWorkShift } from "@/types/employee";

export default function SelectWorkShiftButton({ value, onClick }: { value: string; onClick: (workShift: EmployeeWorkShift) => void }) {
  return (
    <Select value={value} onValueChange={onClick}>
      <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Work Shift" />
      </SelectTrigger>
      <SelectContent className="font-medium">
        <SelectItem value="MORNING">Morning</SelectItem>
        <SelectItem value="NOON">Noon</SelectItem>
        <SelectItem value="NIGHT">Night</SelectItem>
      </SelectContent>
    </Select>
  );
}
