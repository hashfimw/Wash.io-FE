import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { OrderStatus } from "@/types/order";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";

import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/api/auth/useAdminAuth";

interface OrderFiltersProps {
  onSearch?: (value: string) => void;
  onStatusChange?: (status: OrderStatus | "") => void;
  onDateRangeChange?: (dates: { startDate: Date; endDate: Date } | null) => void;
  onOutletChange?: (outletId: number | null) => void;
}

export function OrderFilters({ onStatusChange, onDateRangeChange, onOutletChange }: OrderFiltersProps) {
  const { user } = useAdminAuth();
  const [outlets, setOutlets] = useState<{ id: number; outletName: string }[]>([]);
  const { getOutlets } = useOutlets();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    const fetchOutlets = async () => {
      if (user?.role === "SUPER_ADMIN") {
        try {
          const response = await getOutlets();
          setOutlets(response.data);
        } catch (error) {
          console.error("Failed to fetch outlets:", error);
        }
      }
    };

    fetchOutlets();
  }, [user]);

  const formatDateRange = () => {
    if (!startDate) return "Pick a date range";

    if (endDate && isSameDay(startDate, endDate)) {
      return format(startDate, "d MMMM yyyy");
    }

    if (endDate) {
      return `${format(startDate, "d MMM yyyy")} - ${format(endDate, "d MMM yyyy")}`;
    }

    return format(startDate, "d MMMM yyyy");
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setStartDate(undefined);
      setEndDate(undefined);
      onDateRangeChange?.(null);
      return;
    }

    if (range.from) {
      setStartDate(range.from);
    }

    if (range.to) {
      setEndDate(range.to);
    } else if (range.from && !range.to) {
      setEndDate(range.from);
    }

    if (range.from) {
      const endDateValue = range.to || range.from;
      onDateRangeChange?.({
        startDate: range.from,
        endDate: endDateValue,
      });
    }
  };

  const clearDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartDate(undefined);
    setEndDate(undefined);
    onDateRangeChange?.(null);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {user?.role === "SUPER_ADMIN" && (
        <Select onValueChange={(value) => onOutletChange?.(value === "all" ? null : Number(value))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by outlet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outlet</SelectItem>
            {outlets.map((outlet) => (
              <SelectItem key={outlet.id} value={outlet.id.toString()}>
                {outlet.outletName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select onValueChange={(value) => onStatusChange?.(value as OrderStatus | "")}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all status">All Status</SelectItem>
          {Object.values(OrderStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-[240px] flex-grow md:flex-grow-0 md:max-w-[320px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate flex-grow">{formatDateRange()}</span>
            {startDate && (
              <X
                className="ml-2 h-4 w-4 opacity-70 hover:opacity-100"
                onClick={clearDateFilter}
                aria-label="Clear date filter"
              />
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
              handleDateSelect(range);
              if (range?.from && range?.to) {
                setTimeout(() => setDatePickerOpen(false), 300);
              }
            }}
            numberOfMonths={2}
            initialFocus
          />
          <div className="p-3 border-t flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                setStartDate(today);
                setEndDate(today);
                onDateRangeChange?.({
                  startDate: today,
                  endDate: today,
                });
                setDatePickerOpen(false);
              }}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={clearDateFilter}>
              Reset
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
