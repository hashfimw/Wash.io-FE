"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function SelectLimitButton({ value, onClick }: { value: string; onClick: (limit: string) => void }) {
  return (
    <Select value={value} onValueChange={onClick}>
      <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Limit" />
      </SelectTrigger>
      <SelectContent className="font-medium">
        {[5, 10, 15, 20].map((limit, idx) => (
          <SelectItem key={idx} value={limit.toString()}>
            {limit}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
