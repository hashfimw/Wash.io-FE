"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Outlet } from "@/types/outlet";
import { ReportPeriod } from "@/types/reports";

interface ReportFilterProps {
  outlets: Outlet[];
  showPeriodFilter?: boolean;
  onFilterChange: (filters: {
    outletId?: number;
    startDate?: string;
    endDate?: string;
    period?: ReportPeriod;
  }) => void;
  userRole: string;
  userOutletId?: string;
}

export function ReportFilter({
  outlets,
  showPeriodFilter = false,
  onFilterChange,
  userRole,
  userOutletId,
}: ReportFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOutletAdmin = userRole === "OUTLET_ADMIN";

  const [outletId, setOutletId] = useState<string | null>(() => {
    // For OUTLET_ADMIN: Always use their assigned outlet
    if (isOutletAdmin && userOutletId) {
      return userOutletId;
    }
    // For SUPER_ADMIN: Use from URL or null (all outlets)
    return searchParams.get("outletId") || null;
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : undefined
  );
  const [period, setPeriod] = useState<ReportPeriod>((searchParams.get("period") as ReportPeriod) || "daily");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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
  };

  const clearDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartDate(undefined);
    setEndDate(undefined);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (outletId) {
      params.set("outletId", outletId);
    } else {
      params.delete("outletId");
    }

    if (startDate) {
      params.set("startDate", startDate.toISOString().split("T")[0]);
    } else {
      params.delete("startDate");
    }

    if (endDate) {
      params.set("endDate", endDate.toISOString().split("T")[0]);
    } else {
      params.delete("endDate");
    }

    if (showPeriodFilter && period) {
      params.set("period", period);
    } else if (showPeriodFilter) {
      params.delete("period");
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });

    onFilterChange({
      outletId: outletId ? Number(outletId) : undefined,
      startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
      endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
      period: showPeriodFilter ? period : undefined,
    });
  }, [outletId, startDate, endDate, period, showPeriodFilter]);

  console.log("Outlets props received:", outlets);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="outlet">Outlet</Label>
            <Select
              value={outletId || ""}
              onValueChange={(value) => setOutletId(value === "" ? null : value)}
              disabled={isOutletAdmin}
            >
              <SelectTrigger id="outlet">
                {isOutletAdmin ? (
                  <span>
                    {outlets.find((o) => o.id.toString() === outletId)?.outletName || "Your Outlet"}
                  </span>
                ) : (
                  <SelectValue placeholder="All Outlets" />
                )}
              </SelectTrigger>
              <SelectContent>
                {!isOutletAdmin && <SelectItem value="outlets">All Outlets</SelectItem>}

                {outlets.map((outlet) => (
                  <SelectItem key={outlet.id} value={outlet.id.toString()}>
                    {outlet.outletName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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

          {showPeriodFilter && (
            <div className="space-y-2">
              <Label htmlFor="period">Report Period</Label>
              <Select value={period} onValueChange={(value: ReportPeriod) => setPeriod(value)}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
