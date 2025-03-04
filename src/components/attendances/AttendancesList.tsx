"use client";

import { useDebounce } from "use-debounce";
import { AttendanceRecord, AttendanceSortField, AttendanceType, EmployeeWorkShift } from "@/types/attendance";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAttendance } from "../../hooks/api/attendances/useAttendance";
import { DateRange } from "react-day-picker";
import { useToast } from "../ui/use-toast";
import { toLocalTimeString } from "@/utils/dateTime";
import { TableSkeleton } from "../ui/table-skeleton";
import AttendancesTable from "./AttendancesTable";
import AttendancesFilters from "./AttendancesFilters";
import ZeroFilteredResult from "../driverWorker/ZeroFilteredResult";
import NullAttendance from "./NullAttendance";

export function AttendancesList() {
  const params = useParams();
  const role = params.role as string;

  const router = useRouter();
  const searchParams = useSearchParams();

  const page = +(searchParams.get("page") || "1");
  const limit = searchParams.get("limit") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "";
  const name = searchParams.get("name") || "";
  const outletName = searchParams.get("outletName") || "";
  const attendanceType = searchParams.get("attendanceType") || "";
  const roleFilter = searchParams.get("role") || "";
  const workShift = searchParams.get("workShift") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const [inputName, setInputName] = useState<string>();
  const [debouncedName] = useDebounce(inputName, 500);
  const [inputOutletName, setInputOutletName] = useState<string>();
  const [debouncedOutletName] = useDebounce(inputOutletName, 500);

  const [date, setDate] = useState<DateRange | undefined>();

  const [isNull, setIsNull] = useState<boolean>(false);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalData, setTotalData] = useState<number>(0);

  const { getAttendances, loading: apiLoading, error, checkIsNull } = useAttendance();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const loading = !!(pageLoading || apiLoading);
  const { toast } = useToast();

  const fetchAttendances = async () => {
    const response = await getAttendances({
      page,
      limit: +limit,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      attendanceType: attendanceType as AttendanceType,
      name,
      role: roleFilter as "DRIVER" | "WORKER",
      workShift: workShift as EmployeeWorkShift,
      outletName,
      startDate: date?.from?.toISOString(),
      endDate: date?.to?.toISOString(),
    });
    setAttendances(response.data);
    setTotalPages(response.meta.total_pages);
    setTotalData(response.meta.total_data);
  };

  const fetchCheckIsNull = async () => {
    setPageLoading(true);
    const response = await checkIsNull();
    const isNull = !!response.count;

    setIsNull(!isNull);
    setPageLoading(false);
  };

  useEffect(() => {
    fetchCheckIsNull();
  }, []);

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

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: page.toString() });
  };

  const handleLimitChange = (limit: string) => {
    updateUrlParams({
      limit,
      page: "1",
    });
  };

  const handleSort = (sortByInput: AttendanceSortField) => {
    const direction = sortBy === sortByInput && sortOrder == "asc" ? "desc" : "asc";
    updateUrlParams({
      sortBy: sortByInput,
      sortOrder: direction,
    });
  };

  const handleAttendanceTypeChange = (attendanceType: AttendanceType) => {
    updateUrlParams({
      attendanceType,
      page: "1",
    });
  };

  const handleNameChange = (inputName?: string) => {
    let name = "";
    if (inputName) name = inputName;
    updateUrlParams({
      name,
      page: "1",
    });
  };

  const handleOutletNameChange = (inputOutletName?: string) => {
    let outletName = "";
    if (inputOutletName) outletName = inputOutletName;
    updateUrlParams({
      outletName,
      page: "1",
    });
  };

  const handleRoleChange = (role: "DRIVER" | "WORKER") => {
    updateUrlParams({
      role,
      page: "1",
    });
  };

  const handleWorkShiftChange = (workShift: EmployeeWorkShift) => {
    updateUrlParams({
      workShift,
      page: "1",
    });
  };

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    updateUrlParams({ startDate: startDate || "", endDate: endDate || "", page: "1" });
  };

  const handleResetFilters = () => {
    setDate(undefined);
    const url = new URL(window.location.href);
    url.search = "?page=1";
    router.push(url.pathname + url.search);
  };

  useEffect(() => {
    handleNameChange(debouncedName);
  }, [debouncedName]);

  useEffect(() => {
    handleOutletNameChange(debouncedOutletName);
  }, [debouncedOutletName]);

  useEffect(() => {
    let startDate;
    let endDate;
    if (date?.from) startDate = toLocalTimeString(date.from);
    if (date?.to) endDate = toLocalTimeString(date.to);
    handleDateRangeChange(startDate, endDate);
  }, [date]);

  useEffect(() => {
    setPageLoading(true);
    fetchAttendances();
    setPageLoading(false);
  }, [page, limit, sortBy, sortOrder, name, attendanceType, roleFilter, workShift, outletName, startDate, endDate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const employee = !!(role === "driver" || role === "worker");

  return (
    <div className={`${loading && "pointer-events-none"} sm:p-4  ${employee && "sm:p-6"} flex flex-col sm:bg-white sm:shadow sm:rounded-xl w-full`}>
      {employee && (
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">Attendances History</h1>
          <p className="text-muted-foreground">View list of your attendances history</p>
        </div>
      )}
      {!isNull && (
        <AttendancesFilters
          role={role}
          attendanceType={attendanceType}
          name={inputName}
          roleFilter={roleFilter}
          workShift={workShift}
          outletName={inputOutletName}
          date={date}
          limit={limit}
          onFiltersReset={handleResetFilters}
          onAttendanceTypeChange={handleAttendanceTypeChange}
          onNameChange={setInputName}
          onRoleChange={handleRoleChange}
          onWorkShiftChange={handleWorkShiftChange}
          onOutletNameChange={setInputOutletName}
          onDateChange={setDate}
          onLimitChange={handleLimitChange}
        />
      )}
      {loading ? (
        <TableSkeleton columns={role === "super-admin" ? 7 : role === "outlet-admin" ? 5 : 2} rows={5} />
      ) : error ? (
        <>Error</>
      ) : isNull ? (
        <NullAttendance />
      ) : attendances.length === 0 ? (
        <ZeroFilteredResult />
      ) : (
        <AttendancesTable
          role={role}
          attendances={attendances}
          page={page}
          totalPages={totalPages}
          totalData={totalData}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSort}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
