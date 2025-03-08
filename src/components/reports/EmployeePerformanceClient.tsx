"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useReports } from "@/hooks/api/reports/useReports";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { EmployeePerformanceData, EmployeePerformanceParams } from "@/types/reports";
import { EmployeePerformancePart2 } from "./EmployeePerformanceUi";

interface EmployeePerformanceClientProps {
  role: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialOutletId?: number;
  userOutletId?: string;
}

export function EmployeePerformanceClient({
  role,
  initialStartDate,
  initialEndDate,
  initialOutletId,
  userOutletId,
}: EmployeePerformanceClientProps) {
  const { toast } = useToast();
  const { setBreadcrumbItems } = useBreadcrumb();
  const tableRef = useRef<HTMLDivElement>(null);
  const userRole = role === "super-admin" ? "SUPER_ADMIN" : "OUTLET_ADMIN";
  const { getEmployeePerformance, loading, error: reportError } = useReports();
  const { getOutlets, outlets, error: outletsError } = useOutlets();
  const [performanceData, setPerformanceData] = useState<EmployeePerformanceData>({
    workers: [],
    drivers: [],
  });
  const [workerCurrentPage, setWorkerCurrentPage] = useState(1);
  const [workerTotalPages, setWorkerTotalPages] = useState(1);
  const [driverCurrentPage, setDriverCurrentPage] = useState(1);
  const [driverTotalPages, setDriverTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"workers" | "drivers">("workers");
  const [filters, setFilters] = useState<EmployeePerformanceParams>({
    startDate: initialStartDate,
    endDate: initialEndDate,
    outletId: userRole === "OUTLET_ADMIN" && userOutletId ? Number(userOutletId) : initialOutletId,
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Reports", href: `/dashboard/${role}/reports` },
      { label: "Employee Performance" },
    ]);
  }, [role, setBreadcrumbItems]);

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

  useEffect(() => {
    const fetchPerformanceReport = async () => {
      try {
        if (filters.startDate && filters.endDate) {
          const result = await getEmployeePerformance(filters);
          if (result && result.data) {
            setPerformanceData(result.data);
            if (result && result.pagination) {
              setWorkerCurrentPage(result.pagination.workers.currentPage);
              setWorkerTotalPages(result.pagination.workers.totalPages);

              setDriverCurrentPage(result.pagination.drivers.currentPage);
              setDriverTotalPages(result.pagination.drivers.totalPages);
            }
          }
        } else {
          const endDate = new Date().toISOString().split("T")[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

          // Update filter and URL
          const newFilters = {
            ...filters,
            startDate,
            endDate,
            page: 1,
            limit: 10,
          };

          setFilters(newFilters);

          // Ensure outletId is in filters for OUTLET_ADMIN
          if (userRole === "OUTLET_ADMIN" && userOutletId) {
            newFilters.outletId = Number(userOutletId);
          }
        }
      } catch (err) {
        console.error("Failed to fetch employee performance report:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employee performance report. Please try again.",
        });
      }
    };

    fetchPerformanceReport();
  }, [filters]);

  // Handle workers page change
  const handleWorkerPageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Handle drivers page change
  const handleDriverPageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Handle filter change
  const handleFilterChange = (newFilters: EmployeePerformanceParams) => {
    // For OUTLET_ADMIN, ensure their outlet ID is always used
    if (userRole === "OUTLET_ADMIN" && userOutletId) {
      newFilters.outletId = Number(userOutletId);
    }

    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filter changes
    }));
  };

  // Handle tab change
  const handleTabChange = (tab: "workers" | "drivers") => {
    setActiveTab(tab);
  };

  // Mengalihkan ke part 2
  return (
    <EmployeePerformancePart2
      activeTab={activeTab}
      performanceData={performanceData}
      filters={filters}
      outlets={outlets}
      tableRef={tableRef}
      loading={loading}
      reportError={reportError}
      outletsError={outletsError}
      userRole={userRole}
      userOutletId={userOutletId}
      workerCurrentPage={workerCurrentPage}
      workerTotalPages={workerTotalPages}
      driverCurrentPage={driverCurrentPage}
      driverTotalPages={driverTotalPages}
      handleFilterChange={handleFilterChange}
      handleTabChange={handleTabChange}
      handleWorkerPageChange={handleWorkerPageChange}
      handleDriverPageChange={handleDriverPageChange}
    />
  );
}
