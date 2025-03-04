"use client";

import React, { RefObject } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  EmployeePerformanceData,
  EmployeePerformanceParams,
} from "@/types/reports";
import { ReportFilter } from "./reportFilter";
import { EmployeePerformanceTable } from "./employeePerformanceTable";
import { TablePagination } from "../shared/usePagination";
import { ExportConfig } from "@/utils/exportReport/types";
import { ReportExportMenu } from "./reportExportMenu";

interface EmployeePerformancePart2Props {
  activeTab: "workers" | "drivers";
  performanceData: EmployeePerformanceData;
  filters: EmployeePerformanceParams;
  outlets: any[] | null;
  tableRef: RefObject<HTMLDivElement>;
  loading: boolean;
  reportError: string | null;
  outletsError: string | null;
  userRole: string;
  userOutletId?: string;
  workerCurrentPage: number;
  workerTotalPages: number;
  driverCurrentPage: number;
  driverTotalPages: number;
  handleFilterChange: (newFilters: EmployeePerformanceParams) => void;
  handleTabChange: (tab: "workers" | "drivers") => void;
  handleWorkerPageChange: (page: number) => void;
  handleDriverPageChange: (page: number) => void;
}

export function EmployeePerformancePart2({
  activeTab,
  performanceData,
  filters,
  outlets,
  tableRef,
  loading,
  reportError,
  outletsError,
  userRole,
  userOutletId,
  workerCurrentPage,
  workerTotalPages,
  driverCurrentPage,
  driverTotalPages,
  handleFilterChange,
  handleTabChange,
  handleWorkerPageChange,
  handleDriverPageChange,
}: EmployeePerformancePart2Props) {
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "";

    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength - 3) + "...";
  };

  // Get current outlet name
  const currentOutletName =
    outlets && filters.outletId
      ? outlets.find((o) => o.id === filters.outletId)?.outletName ||
        "All Outlets"
      : "All Outlets";

  const getExportData = () => {
    const maxNameLength = 25;
    const maxOutletLength = 20;
    const maxStationLength = 15;

    if (activeTab === "workers") {
      const workersExportData: Record<string, any> = {};
      performanceData.workers.forEach((worker, index) => {
        workersExportData[index] = {
          id: worker.workerId,
          name: truncateText(worker.workerName, maxNameLength),
          outlet: truncateText(worker.outletName, maxOutletLength),
          station: truncateText(worker.station, maxStationLength),
          totalJobs: worker.totalJobs,
        };
      });
      return workersExportData;
    } else {
      const driversExportData: Record<string, any> = {};
      performanceData.drivers.forEach((driver, index) => {
        driversExportData[index] = {
          id: driver.driverId,
          name: truncateText(driver.driverName, maxNameLength),
          outlet: truncateText(driver.outletName, maxOutletLength),
          totalJobs: driver.totalJobs,
        };
      });
      return driversExportData;
    }
  };

  const exportConfig: ExportConfig = {
    title: `Employee Performance - ${
      activeTab === "workers" ? "Workers" : "Drivers"
    }`,
    startDate: filters.startDate,
    endDate: filters.endDate,
    additionalInfo: {
      Outlet: currentOutletName,
      "Report Type":
        activeTab === "workers" ? "Workers Performance" : "Drivers Performance",
      "Report Generated": new Date().toLocaleString(),
    },
    columnMapping:
      activeTab === "workers"
        ? {
            id: "ID",
            name: "Name",
            outlet: "Outlet",
            station: "Station",
            totalJobs: "Total Jobs",
          }
        : {
            id: "ID",
            name: "Name",
            outlet: "Outlet",
            totalJobs: "Total Jobs",
          },
    // Define custom column widths for better PDF rendering
    columnWidths:
      activeTab === "workers"
        ? {
            id: 1, // ID lebih sempit
            name: 3, // Nama diberi ruang lebih banyak
            outlet: 2.5, // Outlet diberi ruang cukup
            station: 2, // Station sedang
            totalJobs: 1.5, // Total Jobs cukup sempit
          }
        : {
            id: 1, // ID lebih sempit
            name: 3.5, // Nama diberi ruang lebih banyak
            outlet: 3, // Outlet diberi ruang lebih banyak
            totalJobs: 2.5, // Total Jobs cukup lebar
          },
  };

  if (reportError || outletsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {reportError ||
            outletsError ||
            "An error occurred while loading the report."}
        </AlertDescription>
      </Alert>
    );
  }

  const hasData =
    performanceData.workers.length > 0 || performanceData.drivers.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Employee Performance Report</h2>
        <ReportExportMenu
          data={getExportData()}
          config={exportConfig}
          chartRef={tableRef}
          isDisabled={loading || !hasData}
        />
      </div>

      <ReportFilter
        outlets={outlets || []}
        showPeriodFilter={false}
        onFilterChange={handleFilterChange}
        userRole={userRole}
        userOutletId={userOutletId}
      />

      <div ref={tableRef}>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            {currentOutletName} • {filters.startDate} to {filters.endDate}
          </h3>
          <EmployeePerformanceTable
            data={performanceData}
            isLoading={loading}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
      {activeTab === "workers" && (
        <TablePagination
          currentPage={workerCurrentPage}
          totalPages={workerTotalPages}
          onPageChange={handleWorkerPageChange}
        />
      )}
      {activeTab === "drivers" && (
        <TablePagination
          currentPage={driverCurrentPage}
          totalPages={driverTotalPages}
          onPageChange={handleDriverPageChange}
        />
      )}
    </div>
  );
}
