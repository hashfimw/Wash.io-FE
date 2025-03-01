import { useDebounce } from "@/hooks/useDebounce";
import { AttendanceRecord, AttendanceSortField, AttendanceType, EmployeeWorkShift, TableSortConfig } from "@/types/attendance";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAttendance } from "./useAttendance";

export function useAttendanceTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse query parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortField = (searchParams.get("sortBy") || "date") as AttendanceSortField;
  const sortDirection = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";
  const nameFilter = searchParams.get("name") || "";
  const outletNameFilter = searchParams.get("outletName") || "";
  const attendanceTypeFilter = searchParams.get("attendanceType") || "";
  const roleFilter = searchParams.get("role") || "";
  const workShiftFilter = searchParams.get("workShift") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const [nameInput, setNameInput] = useState(nameFilter);
  const [outletInput, setOutletInput] = useState(outletNameFilter);
  const debouncedName = useDebounce(nameInput, 500);
  const debouncedOutlet = useDebounce(outletInput, 500);

  const [sortConfig, setSortConfig] = useState<TableSortConfig<AttendanceSortField>>({
    field: sortField,
    direction: sortDirection,
  });

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

  const handleResetFilters = () => {
    setNameInput("");
    setOutletInput("");

    const url = new URL(window.location.href);
    url.search = "?page=1&sortBy=date&sortOrder=desc";
    router.push(url.pathname + url.search);
  };

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const { getAttendances, loading, error } = useAttendance();

  const fetchAttendances = async () => {
    const response = await getAttendances({
      page,
      limit,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.direction,
      startDate,
      endDate,
      attendanceType: attendanceTypeFilter as AttendanceType,
      name: debouncedName,
      role: roleFilter as "DRIVER" | "WORKER",
      workShift: workShiftFilter as EmployeeWorkShift,
      outletName: debouncedOutlet,
    });
    setAttendances(response.data);
    setTotalPages(response.meta.total_pages);
    setTotalRecords(response.meta.total_data);
  };

  useEffect(() => {
    fetchAttendances();
  }, [
    page,
    limit,
    sortConfig.field,
    sortConfig.direction,
    debouncedName,
    debouncedOutlet,
    attendanceTypeFilter,
    roleFilter,
    workShiftFilter,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    setNameInput(nameFilter);
    setOutletInput(outletNameFilter);
  }, [nameFilter, outletNameFilter]);

  useEffect(() => {
    setSortConfig({
      field: sortField,
      direction: sortDirection,
    });
  }, [sortField, sortDirection]);

  return {
    attendances,
    loading,
    error,
    totalPages,
    totalRecords,

    currentPage: page,
    setCurrentPage: handlePageChange,
    currentLimit: limit,
    setCurrentLimit: handleLimitChange,

    sortConfig,
    setSortConfig: handleSort,

    name: nameInput,
    searchName: setNameInput,
    outlet: outletInput,
    searchOutlet: setOutletInput,

    attendancesType: attendanceTypeFilter,
    setAttendanceType: handleAttendanceTypeChange,
    role: roleFilter,
    setRole: handleRoleChange,
    workShift: workShiftFilter,
    setWorkShift: handleWorkShiftChange,
    startDate,
    endDate,
    setDateRange: handleDateRangeChange,

    resetFilters: handleResetFilters,
  };
}
