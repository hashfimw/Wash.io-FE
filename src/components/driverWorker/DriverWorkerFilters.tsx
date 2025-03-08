"use client";

import { TransportType } from "@/types/order";
import { DatePickerWithRange } from "../attendances/DateRangePicker";
import ResetFiltersButton from "../attendances/ResetFiltersButton";
import SelectLimitButton from "../attendances/SelectLimitButton";
import SelectTransportTypeButton from "./SelectTransportTypeButton";
import { DateRange } from "react-day-picker";
import { Filter } from "lucide-react";
import { Separator } from "../ui/separator";

interface DriverWorkerFiltersProps {
  endPoint: string;
  requestType: string;
  onFiltersReset: () => void;
  transportType: string;
  onTransportTypeChange: (transportType: TransportType) => void;
  limit: string;
  onLimitChange: (limit: string) => void;
  date: DateRange | undefined;
  onDateChange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export default function DriverWorkerFilters({
  endPoint,
  requestType,
  onFiltersReset: handleResetFilters,
  transportType,
  onTransportTypeChange: handleTransportTypeChange,
  limit,
  onLimitChange: handleLimitChange,
  date,
  onDateChange: handleDateRangeChange,
}: DriverWorkerFiltersProps) {

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="size-5" />
          <p className="font-semibold text-lg">Filters</p>
        </div>
        <ResetFiltersButton onClick={handleResetFilters} />
      </div>
      <div className="flex gap-3 items-center overflow-x-scroll py-4">
        {requestType === "history" && (
          <div className="flex gap-3 items-center">
            <DatePickerWithRange date={date} setDate={handleDateRangeChange} className="min-w-[300px] w-[300px]" />
          </div>
        )}
        {endPoint === "transport-jobs" && <SelectTransportTypeButton value={transportType} onClick={handleTransportTypeChange} />}
        <div className={`ml-auto`}>
          <SelectLimitButton value={limit} onClick={handleLimitChange} />
        </div>
      </div>
      <Separator className="mb-2" />
    </>
  );
}
