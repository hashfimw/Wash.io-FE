"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function SelectRoleButton({ value, onClick }: { value: string; onClick: (role: "DRIVER" | "WORKER") => void }) {
  return (
    <Select value={value} onValueChange={onClick}>
      <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent className="font-medium">
        <SelectItem value="DRIVER">Driver</SelectItem>
        <SelectItem value="WORKER">Worker</SelectItem>
      </SelectContent>
    </Select>
  );
}
