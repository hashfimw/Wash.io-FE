import { useDebounce } from "@/hooks/useDebounce";
import { AttendanceRecord, AttendanceSortField, AttendanceType, TableSortConfig } from "@/types/attendance";
import { EmployeeWorkShift } from "@/types/employee";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAttendance } from "./useAttendance";

export function useAttendancesTableAlt() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [currentLimit, setLimit] = useState<number>(Number(searchParams.get("limit")) || 10);
  const [sortConfig, setSortConfig] = useState<TableSortConfig<AttendanceSortField>>({
    field: searchParams.has("sortBy") ? (searchParams.get("sortBy") as AttendanceSortField) : "date",
    direction: searchParams.has("sortOrder") ? (searchParams.get("sortOrder") as "asc" | "desc") : "desc",
  });
  const [attendanceType, setAttendanceType] = useState<AttendanceType | null>(
    searchParams.has("attendanceType") ? (searchParams.get("attendanceType") as AttendanceType) : null
  );
  const [role, setRole] = useState<"DRIVER" | "WORKER" | null>(searchParams.has("role") ? (searchParams.get("role") as "DRIVER" | "WORKER") : null);
  const [workShift, setWorkShift] = useState<EmployeeWorkShift | null>(
    searchParams.has("workShift") ? (searchParams.get("workShift") as EmployeeWorkShift) : null
  );
  const [dateRange, setDateRange] = useState({
    startDate: searchParams.has("startDate") ? searchParams.get("startDate") : null,
    endDate: searchParams.has("endDate") ? searchParams.get("endDate") : null,
  });
  const [nameInput, setNameInput] = useState<string | null>(searchParams.has("name") ? searchParams.get("name") : null);
  const [outletNameInput, setoutletNameInput] = useState<string | null>(searchParams.has("outletName") ? searchParams.get("outletName") : null);
  const debouncedName = useDebounce(nameInput, 500);
  const debouncedOutlet = useDebounce(outletNameInput, 500);

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const { loading, error, getAttendances } = useAttendance();

  const updateUrlParams = (params: Record<string, string>) => {
    const url = new URL(window.location.href);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    router.push(url.pathname + url.search);
  };

  const handleSort = (field: AttendanceSortField) => {
    const direction = sortConfig.field === field && sortConfig.direction === "desc" ? "asc" : "desc";
    setSortConfig({ field, direction });
    updateUrlParams({
      sortBy: field,
      sortOrder: direction,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage.toString() });
  };

  const handleLimitChange = (newLimit: string) => {
    updateUrlParams({
      limit: newLimit,
      page: "1",
    });
  };

  const handleAttendanceTypeChange = (value: string) => {
    updateUrlParams({
      attendanceType: value,
      page: "1",
    });
  };

  const handleRoleChange = (value: string) => {
    updateUrlParams({
      role: value,
      page: "1",
    });
  };

  const handleWorkShiftChange = (value: string) => {
    updateUrlParams({
      workShift: value,
      page: "1",
    });
  };

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    updateUrlParams({
      startDate: start || "",
      endDate: end || "",
      page: "1",
    });
  };

useEffect
}
