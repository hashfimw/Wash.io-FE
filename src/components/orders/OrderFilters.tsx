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
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
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
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Fetch outlets only if user is super admin
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

  // Format date range for display
  const formatDateRange = () => {
    if (!startDate) return "Pick a date range";

    // Jika tanggal awal dan akhir sama (satu hari)
    if (endDate && isSameDay(startDate, endDate)) {
      return format(startDate, "d MMMM yyyy");
    }

    // Jika ada rentang tanggal
    if (endDate) {
      return `${format(startDate, "d MMM yyyy")} - ${format(
        endDate,
        "d MMM yyyy"
      )}`;
    }

    // Jika hanya ada tanggal awal
    return format(startDate, "d MMMM yyyy");
  };

  // Handle date selection
  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setStartDate(undefined);
      setEndDate(undefined);
      onDateRangeChange?.(null);
      return;
    }

    // Set tanggal awal
    if (range.from) {
      setStartDate(range.from);
    }

    // Set tanggal akhir
    if (range.to) {
      setEndDate(range.to);
    } else if (range.from && !range.to) {
      // Jika pengguna hanya memilih satu tanggal, gunakan tanggal tersebut
      // sebagai tanggal awal dan akhir (filter untuk satu hari)
      setEndDate(range.from);
    }

    // Kirim ke parent component jika kedua tanggal sudah dipilih
    if (range.from) {
      const endDateValue = range.to || range.from;
      onDateRangeChange?.({
        startDate: range.from,
        endDate: endDateValue,
      });
    }
  };

  // Clear date filter
  const clearDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah popover tertutup
    setStartDate(undefined);
    setEndDate(undefined);
    onDateRangeChange?.(null);
  };

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
            <SelectItem value="all">All Outlet</SelectItem>
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
              {status
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Picker */}
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
              // Biarkan popover tetap terbuka sampai pengguna memilih tanggal kedua
              if (range?.from && range?.to) {
                // Tutup popover setelah pengguna memilih rentang tanggal lengkap
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
                // Pilih satu hari - hari ini
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
