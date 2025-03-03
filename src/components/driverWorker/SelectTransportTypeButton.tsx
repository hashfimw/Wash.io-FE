"use client";

import { TransportType } from "@/types/order";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function SelectTransportTypeButton({ value, onClick }: { value: string; onClick: (transportType: TransportType) => void }) {
  return (
    <Select value={value} onValueChange={onClick}>
      <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
        <SelectValue placeholder="Transport Type" />
      </SelectTrigger>
      <SelectContent className="font-medium">
        <SelectItem value="PICKUP">Pickup</SelectItem>
        <SelectItem value="DELIVERY">Delivery</SelectItem>
      </SelectContent>
    </Select>
  );
}
