"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TablePagination } from "../shared/usePagination";
import { AttendanceRecord, AttendanceSortField } from "@/types/attendance";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

interface AttendancesTableProps {
  role: string;
  attendances: AttendanceRecord[];
  page: number;
  totalPages: number;
  totalData: number;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortByInput: AttendanceSortField) => void;
  onPageChange: (page: number) => void;
}

export default function AttendancesTable({
  role,
  attendances,
  page,
  totalPages,
  totalData,
  sortBy,
  sortOrder,
  onSortChange: handleSort,
  onPageChange: handlePageChange,
}: AttendancesTableProps) {
  const sortOrderSymbol = (sortByInput: string) => {
    if (sortBy == sortByInput) {
      if (sortOrder == "asc") return " ↑";
      else return " ↓";
    } else return "";
  };

  const admin = !!(role === "super-admin" || role === "outlet-admin");

  return (
    <div className="flex flex-col items-center space-y-3">
      <p className="text-muted-foreground place-self-start translate-y-1 text-sm">Click on the column's header to sort by column</p>
      <div className="rounded-md border text-center w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted hover:cursor-pointer">
              <TableHead onClick={() => handleSort("date")} className="text-center font-semibold hover:bg-neutral-200 transition">
                Submit Date{sortOrderSymbol("date")}
              </TableHead>
              <TableHead onClick={() => handleSort("attendanceType")} className="text-center font-semibold hover:bg-neutral-200 transition">
                Attendance Type{sortOrderSymbol("attendanceType")}
              </TableHead>
              {admin && (
                <>
                  <TableHead onClick={() => handleSort("name")} className="text-center font-semibold hover:bg-neutral-200 transition">
                    Name{sortOrderSymbol("name")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("role")} className="text-center font-semibold hover:bg-neutral-200 transition">
                    Role{sortOrderSymbol("role")}
                  </TableHead>
                  <TableHead onClick={() => handleSort("workShift")} className="text-center font-semibold hover:bg-neutral-200 transition">
                    Work Shift{sortOrderSymbol("workShift")}
                  </TableHead>
                </>
              )}
              {role === "super-admin" && (
                <TableHead onClick={() => handleSort("outletName")} className="text-center font-semibold hover:bg-neutral-200 transition">
                  Outlet Name{sortOrderSymbol("outletName")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.map((record) => (
              <TableRow key={record.id} className="h-10">
                <TableCell className="min-w-44">{format(new Date(record.date), "PPPp")}</TableCell>
                <TableCell className="min-w-40">
                  <Badge
                    variant="outline"
                    className={`${
                      record.attendanceType === "CLOCK_IN"
                        ? "border-lime-700/75 text-lime-700/75 bg-lime-100/75"
                        : "border-rose-700/75 text-rose-700/75 bg-rose-100/75"
                    } rounded-lg font-semibold flex items-center place-content-center w-[84px] mx-auto`}
                  >
                    {record.attendanceType === "CLOCK_IN" ? "Clock-in" : "Clock-out"}
                  </Badge>
                </TableCell>
                {admin && (
                  <>
                    <TableCell className="min-w-64">{record.name}</TableCell>
                    <TableCell className="min-w-32">
                      <Badge
                        variant="outline"
                        className={`${
                          record.role === "DRIVER" ? "bg-birtu" : "bg-oren"
                        } rounded-lg font-semibold flex items-center place-content-center w-[84px] text-white mx-auto`}
                      >
                        {record.role === "DRIVER" ? "Driver" : "Worker"}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-32">
                      <Badge
                        variant="outline"
                        className={`${
                          record.workShift === "MORNING" ? "bg-yellow-500" : record.workShift === "NOON" ? "bg-sky-400" : "bg-slate-700"
                        } rounded-lg text-white font-semibold flex items-center place-content-center w-[84px] mx-auto`}
                      >
                        {record.workShift === "MORNING" ? "Morning" : record.workShift === "NOON" ? "Noon" : "Night"}
                      </Badge>
                    </TableCell>
                  </>
                )}
                {role === "super-admin" && <TableCell className="min-w-64">{record.outletName}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p>
        Showing {attendances.length} out of {totalData} submission(s)
      </p>
      {totalPages > 1 && <TablePagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
