export type ReportPeriod = "daily" | "monthly" | "yearly";

export interface SalesReportParams {
  startDate?: string;
  endDate?: string;
  outletId?: number;
  period?: ReportPeriod;
  page?: number;
  limit?: number;
}

export interface EmployeePerformanceParams {
  startDate?: string;
  endDate?: string;
  outletId?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortList?: "asc" | "desc";
}

export interface SalesReportData {
  [key: string]: number;
}

export interface WorkerPerformance {
  workerId: number;
  workerName: string;
  outletName: string;
  station: string;
  totalJobs: number;
}

export interface DriverPerformance {
  driverId: number;
  driverName: string;
  outletName: string;
  totalJobs: number;
}

export interface EmployeePerformanceData {
  workers: WorkerPerformance[];
  drivers: DriverPerformance[];
}

export interface SalesReportResponse {
  data: SalesReportData;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmployeePerformanceResponse {
  pagination: {
    workers: {
      currentPage: number;
      totalPages: number;
    };
    drivers: {
      currentPage: number;
      totalPages: number;
    };
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: EmployeePerformanceData;
}
