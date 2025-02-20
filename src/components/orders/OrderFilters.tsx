// src/components/orders/OrderFilters.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/types/order";

interface OrderFiltersProps {
  onSearch?: (value: string) => void;
  onStatusChange?: (status: OrderStatus | "") => void;
  onDateChange?: (date: string) => void;
}

export function OrderFilters({
  onSearch,
  onStatusChange,
  onDateChange,
}: OrderFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Search orders..."
        onChange={(e) => onSearch?.(e.target.value)}
        className="max-w-[300px]"
      />

      <Select
        onValueChange={(value) => onStatusChange?.(value as OrderStatus | "")}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all status">All Status</SelectItem>
          {Object.values(OrderStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        onChange={(e) => onDateChange?.(e.target.value)}
        className="max-w-[200px]"
      />
    </div>
  );
}
