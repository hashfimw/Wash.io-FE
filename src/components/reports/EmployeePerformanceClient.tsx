"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useReports } from "@/hooks/api/reports/useReports";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmployeePerformanceData,
  EmployeePerformanceParams,
} from "@/types/reports";
import { ReportFilter } from "./reportFilter";
import { EmployeePerformanceTable } from "./employeePerformanceTable";
import { TablePagination } from "../shared/usePagination";

interface EmployeePerformanceClientProps {
  role: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialOutletId?: number;
}

export function EmployeePerformanceClient({
  role,
  initialStartDate,
  initialEndDate,
  initialOutletId,
}: EmployeePerformanceClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { setBreadcrumbItems } = useBreadcrumb();

  // API hooks
  const { getEmployeePerformance, loading, error: reportError } = useReports();
  const {
    getOutlets,
    outlets,
    loading: outletsLoading,
    error: outletsError,
  } = useOutlets();

  // State untuk data dan pagination
  const [performanceData, setPerformanceData] =
    useState<EmployeePerformanceData>({
      workers: [],
      drivers: [],
    });

  // State untuk pagination
  const [workerCurrentPage, setWorkerCurrentPage] = useState(1);
  const [workerTotalPages, setWorkerTotalPages] = useState(1);
  const [driverCurrentPage, setDriverCurrentPage] = useState(1);
  const [driverTotalPages, setDriverTotalPages] = useState(1);

  // State untuk filter dan tab aktif
  const [activeTab, setActiveTab] = useState<"workers" | "drivers">("workers");
  const [filters, setFilters] = useState<EmployeePerformanceParams>({
    startDate: initialStartDate,
    endDate: initialEndDate,
    outletId: initialOutletId,
    page: 1,
    limit: 10,
  });

  // Set breadcrumb
  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Reports", href: `/dashboard/${role}/reports` },
      { label: "Employee Performance" },
    ]);
  }, [role, setBreadcrumbItems]);

  // Fetch outlets
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        await getOutlets();
      } catch (err) {
        console.error("Failed to fetch outlets:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load outlets. Please try again.",
        });
      }
    };

    fetchOutlets();
  }, []);

  // Fetch performance report dengan pagination
  useEffect(() => {
    const fetchPerformanceReport = async () => {
      try {
        // Pastikan ada rentang tanggal
        if (filters.startDate && filters.endDate) {
          const result = await getEmployeePerformance(filters);

          // Update data performance
          if (result && result.data) {
            setPerformanceData(result.data);

            // Update pagination untuk workers dan drivers
            if (result && result.pagination) {
              setWorkerCurrentPage(result.pagination.workers.currentPage);
              setWorkerTotalPages(result.pagination.workers.totalPages);

              setDriverCurrentPage(result.pagination.drivers.currentPage);
              setDriverTotalPages(result.pagination.drivers.totalPages);
            }
          }
        } else {
          // Set rentang tanggal default jika tidak ada
          const endDate = new Date().toISOString().split("T")[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

          // Update filter
          const newFilters = {
            ...filters,
            startDate,
            endDate,
            page: 1,
            limit: 10,
          };
          setFilters(newFilters);
        }
      } catch (err) {
        console.error("Failed to fetch employee performance report:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to load employee performance report. Please try again.",
        });
      }
    };

    fetchPerformanceReport();
  }, [filters]);

  // Handler untuk perubahan halaman workers
  const handleWorkerPageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Handler untuk perubahan halaman drivers
  const handleDriverPageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Handler untuk perubahan filter
  const handleFilterChange = (newFilters: EmployeePerformanceParams) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset ke halaman pertama saat filter berubah
    }));
  };

  // Handler untuk perubahan tab
  const handleTabChange = (tab: "workers" | "drivers") => {
    setActiveTab(tab);
  };

  // Fungsi export
  const handleExport = () => {
    const workersData = [
      ["Worker ID", "Name", "Outlet", "Station", "Total Jobs"],
      ...performanceData.workers.map((worker) => [
        worker.workerId.toString(),
        worker.workerName,
        worker.outletName,
        worker.station,
        worker.totalJobs.toString(),
      ]),
    ];

    const driversData = [
      ["Driver ID", "Name", "Outlet", "Total Jobs"],
      ...performanceData.drivers.map((driver) => [
        driver.driverId.toString(),
        driver.driverName,
        driver.outletName,
        driver.totalJobs.toString(),
      ]),
    ];

    const csvRows = [
      ["EMPLOYEE PERFORMANCE REPORT"],
      ["Date Range:", `${filters.startDate} to ${filters.endDate}`],
      [""],
      ["WORKERS"],
      ...workersData,
      [""],
      ["DRIVERS"],
      ...driversData,
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `employee_performance_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  // Render error state
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
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={loading || !hasData}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <ReportFilter
        outlets={outlets || []}
        showPeriodFilter={false}
        onFilterChange={handleFilterChange}
      />

      <EmployeePerformanceTable
        data={performanceData}
        isLoading={loading}
        onTabChange={handleTabChange}
      />

      {/* Pagination untuk Workers */}
      {activeTab === "workers" && (
        <TablePagination
          currentPage={workerCurrentPage}
          totalPages={workerTotalPages}
          onPageChange={handleWorkerPageChange}
        />
      )}

      {/* Pagination untuk Drivers */}
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
