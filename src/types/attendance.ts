export enum EmployeeWorkShift {
  MORNING = "MORNING",
  NOON = "NOON",
  NIGHT = "NIGHT",
}

export enum AttendanceType {
  CLOCK_IN = "CLOCK_IN",
  CLOCK_OUT = "CLOCK_OUT",
}

export interface AttendanceRecord {
  id: number;
  date: string;
  attendanceType: AttendanceType;
  employeeId: number;
  name: string;
  role: "DRIVER" | "WORKER";
  workShift: EmployeeWorkShift;
  outletId: number;
  outletName: string;
}

export interface GetAttendancesRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  attendanceType?: AttendanceType;
  name?: string;
  role?: "DRIVER" | "WORKER";
  workShift?: EmployeeWorkShift;
  outletName?: string;
}

export interface GetAttendancesResponse {
  data: AttendanceRecord[];
  meta: {
    page: number;
    limit: number;
    total_pages: number;
    total_data: number;
  };
}

export type AttendanceSortField = "id" | "date" | "attendanceType" | "name" | "role" | "workShift" | "outletName";

export interface TableSortConfig<T> {
  field: T;
  direction: "asc" | "desc";
}

export interface TableProps<T> extends TableSortConfig<T> {
  page: number;
  limit: number;
}
