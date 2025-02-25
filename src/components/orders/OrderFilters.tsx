// src/components/orders/OrderFilters.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { OrderStatus } from "@/types/order";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/api/auth/useAdminAuth";

interface OrderFiltersProps {
  onSearch?: (value: string) => void;
  onStatusChange?: (status: OrderStatus | "") => void;
  onDateRangeChange?: (
    dates: { startDate: Date; endDate: Date } | null
  ) => void;
  onOutletChange?: (outletId: number | null) => void;
}

export function OrderFilters({
  onStatusChange,
  onDateRangeChange,
  onOutletChange,
}: OrderFiltersProps) {
  const { user } = useAuth(); // Get current user
  const [outlets, setOutlets] = useState<{ id: number; outletName: string }[]>(
    []
  );
  const { getOutlets, loading: outletsLoading } = useOutlets();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Fetch outlets only if user is super admin
  useEffect(() => {
    const fetchOutlets = async () => {
      console.log("Current user:", user); // Tambahkan ini
      console.log("User role:", user?.role); // Tambahkan ini
      if (user?.role === "SUPER_ADMIN") {
        try {
          const response = await getOutlets();
          console.log("Outlets response:", response); // Tambahkan ini
          setOutlets(response.data);
        } catch (error) {
          console.error("Failed to fetch outlets:", error);
        }
      }
    };

    fetchOutlets();
  }, [user]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Outlet Filter - Only show for SUPER_ADMIN */}
      {user?.role === "SUPER_ADMIN" && (
        <Select
          onValueChange={(value) =>
            onOutletChange?.(value === "all" ? null : Number(value))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by outlet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outlets</SelectItem>
            {outlets.map((outlet) => (
              <SelectItem key={outlet.id} value={outlet.id.toString()}>
                {outlet.outletName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status Filter */}
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

      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? (
              endDate ? (
                <>
                  {format(startDate, "PPP")} - {format(endDate, "PPP")}
                </>
              ) : (
                format(startDate, "PPP")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={(range) => {
              if (range?.from) setStartDate(range.from);
              if (range?.to) setEndDate(range.to);
              if (range?.from && range?.to) {
                onDateRangeChange?.({
                  startDate: range.from,
                  endDate: range.to,
                });
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
