"use client";

import { AttendanceRecord, AttendanceSortField, AttendanceType, GetEmployeeStatusResponse } from "@/types/attendance";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { useDebounce } from "use-debounce";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeWorkShift } from "@/types/employee";
import { toLocalTimeString } from "@/utils/dateTime";
import AttendancesFilters from "./AttendancesFilters";
import { TableSkeleton } from "../ui/table-skeleton";
import ErrorTable from "../driverWorker/ErrorTable";
import NullAttendance from "./NullAttendance";
import ZeroFilteredResult from "../driverWorker/ZeroFilteredResult";
import AttendancesTable from "./AttendancesTable";
import AttendanceSubmission from "./AttendanceSubmission";
import { useAttendance } from "@/hooks/api/attendances/useAttendance";

export default function AttendancesList() {
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

  const [employeeStatus, setEmployeeStatus] = useState<GetEmployeeStatusResponse>({
    canClockIn: false,
    isAttended: false,
    isOnWorkShift: false,
    isPresent: false,
    isWorking: false,
    shiftStart: new Date().toString(),
    workShift: "MORNING" as EmployeeWorkShift,
  });
  const [isAlertOpen, setAlertOpen] = useState<boolean>(false);
  const [submitValue, setSubmitValue] = useState<"CLOCK_IN" | "CLOCK_OUT">();
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const {
    getAttendances,
    checkIsNull,
    listLoading: apiListLoading,
    listError,
    getEmployeeStatus,
    createAttendance,
    submitLoading,
    submitError,
  } = useAttendance();
  const [listPageLoading, setListPageLoading] = useState<boolean>(true);
  const listLoading = !!(listPageLoading || apiListLoading);

  const { toast } = useToast();

  const fetchAttendances = async () => {
    setListPageLoading(true);
    const response = await getAttendances({
      page,
      limit: +limit,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      attendanceType: attendanceType as AttendanceType,
      name: debouncedName,
      role: roleFilter as "DRIVER" | "WORKER",
      workShift: workShift as EmployeeWorkShift,
      outletName: debouncedOutletName,
      startDate: date?.from?.toISOString(),
      endDate: date?.to?.toISOString(),
    });
    setAttendances(response.data);
    setTotalPages(response.meta.total_pages);
    setTotalData(response.meta.total_data);
    setListPageLoading(false);
  };

  const fetchCheckIsNull = async () => {
    setListPageLoading(true);
    const response = await checkIsNull();
    const isNull = !!response.count;

    setIsNull(!isNull);
    setListPageLoading(false);
  };

  const fetchEmployeeStatus = async () => {
    const response = await getEmployeeStatus();

    setEmployeeStatus(response.data);
  };

  const submitAttendance = async (attendanceType: "CLOCK_IN" | "CLOCK_OUT") => {
    setIsSuccess(false);
    const response = await createAttendance(attendanceType);

    if (!submitError) {
      toast({
        title: "Submission success",
        description: response,
        variant: "default",
      });
      handleResetFilters();
      setIsSuccess(true);
      setTimeout(() => handleAfterSuccessSubmit(), 1500);
    } else {
      toast({
        title: "Error",
        description: submitError,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCheckIsNull();
  }, []);

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
    fetchAttendances();
  }, [page, limit, sortBy, sortOrder, name, attendanceType, roleFilter, workShift, outletName, startDate, endDate]);

  useEffect(() => {
    fetchEmployeeStatus();
  }, [isSuccess]);

  useEffect(() => {
    if (listError) {
      toast({
        title: "Error",
        description: listError,
        variant: "destructive",
      });
    }
  }, [listError]);

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

  const handleSubmit = () => {
    setAlertOpen(false);
    submitAttendance(submitValue!);
  };

  const handleAfterSuccessSubmit = () => {
    fetchCheckIsNull();
    fetchAttendances();
  };

  const handleCloseModal = () => {
    setAlertOpen(false);
  };

  const handleOpenModal = (value: "CLOCK_IN" | "CLOCK_OUT") => {
    setSubmitValue(value);
    setAlertOpen(true);
  };

  const currentHour = new Date().getHours();

  const shiftStartHour = () => {
    if (employeeStatus.workShift === "MORNING") return 6;
    else if (employeeStatus.workShift === "NOON") return 14;
    else return 22;
  };

  const shiftEndHour = () => {
    if (employeeStatus.workShift === "MORNING") return 14;
    else if (employeeStatus.workShift === "NOON") return 22;
    else return 6;
  };

  const nextShiftHour = () => {
    if (employeeStatus.workShift === "MORNING") return 5;
    else if (employeeStatus.workShift === "NOON") return 13;
    else return 21;
  };

  const conditions = {
    isClockedOut: !!(!employeeStatus.canClockIn && !employeeStatus.isPresent && employeeStatus.isAttended),
    isOffShift: !!(!employeeStatus.canClockIn && !employeeStatus.isPresent && !employeeStatus.isAttended),
    canSubmit: !!(employeeStatus.canClockIn && !employeeStatus.isPresent),
    isWaiting: !!(employeeStatus.isPresent && !employeeStatus.isOnWorkShift && currentHour < shiftStartHour()),
    isIdling: !!(employeeStatus.isPresent && !employeeStatus.isWorking && employeeStatus.isOnWorkShift),
    isBusy: !!(employeeStatus.isPresent && employeeStatus.isWorking),
    isPresent: employeeStatus.isPresent,
    isWorking: employeeStatus.isWorking,
    canClockIn: employeeStatus.canClockIn,
  };

  const hours = {
    shiftStart: shiftStartHour().toString(),
    shiftEnd: shiftEndHour().toString(),
    nextShift: nextShiftHour().toString(),
  };

  const employee = !!(role === "driver" || role === "worker");

  return (
    <div className={`mx-auto p-3 space-y-6 ${employee && "max-w-screen-lg"}`}>
      {!employee && (
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Attendances History</h1>
          <p className="text-muted-foreground">{"View list of employees' attendances history"}</p>
        </div>
      )}
      {employee && (
        <AttendanceSubmission
          loading={submitLoading}
          error={submitError}
          conditions={conditions}
          hours={hours}
          isAlertOpen={isAlertOpen}
          onOpenModal={handleOpenModal}
          onCloseModal={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
      <div
        className={`${listLoading && "pointer-events-none"} sm:p-4  ${employee && "sm:p-6"} flex flex-col sm:bg-white sm:shadow sm:rounded-xl w-full`}
      >
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
        {listLoading ? (
          <TableSkeleton columns={role === "super-admin" ? 7 : role === "outlet-admin" ? 5 : 2} rows={5} />
        ) : listError ? (
          <ErrorTable errorMessage={listError} />
        ) : isNull ? (
          <NullAttendance />
        ) : attendances.length !== 0 ? (
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
        ) : (
          <ZeroFilteredResult />
        )}
      </div>
    </div>
  );
}
