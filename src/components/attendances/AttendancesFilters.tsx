"use client";

import { AttendanceType } from "@/types/attendance";
import { EmployeeWorkShift } from "@/types/employee";
import { DateRange } from "react-day-picker";
import ResetFiltersButton from "./ResetFiltersButton";
import { DatePickerWithRange } from "./DateRangePicker";
import SelectAttendanceTypeButton from "./SelectAttendanceTypeButton";
import SelectRoleButton from "./SelectRoleButton";
import SelectWorkShiftButton from "./SelectWorkShiftButton";
import { Input } from "../ui/input";
import SelectLimitButton from "./SelectLimitButton";
import { Dispatch, SetStateAction } from "react";
import { Filter } from "lucide-react";
import { Separator } from "../ui/separator";

interface AttendancesFiltersProps {
  role: string;
  attendanceType: string;
  name?: string;
  roleFilter: string;
  workShift: string;
  outletName?: string;
  date: DateRange | undefined;
  limit: string;
  onFiltersReset: () => void;
  onAttendanceTypeChange: (attendanceType: AttendanceType) => void;
  onNameChange: Dispatch<SetStateAction<string | undefined>>;
  onRoleChange: (role: "DRIVER" | "WORKER") => void;
  onWorkShiftChange: (workShift: EmployeeWorkShift) => void;
  onOutletNameChange: Dispatch<SetStateAction<string | undefined>>;
  onDateChange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onLimitChange: (limit: string) => void;
}

export default function AttendancesFilters({
  role,
  attendanceType,
  name,
  roleFilter,
  workShift,
  outletName,
  date,
  limit,
  onFiltersReset: handleResetFilters,
  onAttendanceTypeChange: handleAttendanceTypeChange,
  onNameChange: handleNameChange,
  onRoleChange: handleRoleChange,
  onWorkShiftChange: handleWorkShiftChange,
  onOutletNameChange: handleOutletNameChange,
  onDateChange: handleDateRangeChange,
  onLimitChange: handleLimitChange,
}: AttendancesFiltersProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="size-5" />
          <p className="font-semibold text-lg">Filters</p>
        </div>
        <ResetFiltersButton onClick={handleResetFilters} />
      </div>
      {role === "super-admin" || role === "outlet-admin" ? (
        <div className="flex gap-3 items-center overflow-x-scroll py-4">
          <DatePickerWithRange date={date} setDate={handleDateRangeChange} className="min-w-[300px] w-[300px]" />
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Search employee name..."
            className="w-[300px] min-w-[300px]"
          />
          {role === "super-admin" && (
            <Input
              value={outletName}
              onChange={(e) => handleOutletNameChange(e.target.value)}
              placeholder="Search outlet name..."
              className="w-[300px] min-w-[300px]"
            />
          )}
          <SelectAttendanceTypeButton value={attendanceType} onClick={handleAttendanceTypeChange} />
          <SelectRoleButton value={roleFilter} onClick={handleRoleChange} />
          <SelectWorkShiftButton value={workShift} onClick={handleWorkShiftChange} />
          <div className="ml-auto">
            <SelectLimitButton value={limit} onClick={handleLimitChange} />
          </div>
        </div>
      ) : (
        <div className="flex gap-3 items-center overflow-x-scroll py-4">
          <DatePickerWithRange date={date} setDate={handleDateRangeChange} className="min-w-[300px] w-[300px]" />
          <SelectAttendanceTypeButton value={attendanceType} onClick={handleAttendanceTypeChange} />
          <div className="ml-auto">
            <SelectLimitButton value={limit} onClick={handleLimitChange} />
          </div>
        </div>
      )}
      <Separator className="mb-2" />
    </>
  );
}
