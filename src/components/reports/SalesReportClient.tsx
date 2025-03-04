"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useReports } from "@/hooks/api/reports/useReports";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import {
  ReportPeriod,
  SalesReportData,
  SalesReportParams,
} from "@/types/reports";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SalesReportChart } from "./salesReportChart";
import { ReportFilter } from "./reportFilter";
import { ExportConfig } from "@/utils/exportReport/types";
import { ReportExportMenu } from "./reportExportMenu";

interface SalesReportClientProps {
  role: string;
  initialPeriod: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialOutletId?: number;
  initialPage: number;
  initialLimit: number;
  userOutletId?: string;
}

export function SalesReportClient({
  role,
  initialPeriod,
  initialStartDate,
  initialEndDate,
  initialOutletId,
  initialPage,
  initialLimit,
  userOutletId,
}: SalesReportClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { setBreadcrumbItems } = useBreadcrumb();
  const chartRef = useRef<HTMLDivElement>(null);
  const userRole = role === "super-admin" ? "SUPER_ADMIN" : "OUTLET_ADMIN";
  const { getSalesReport, loading, error: reportError } = useReports();
  const {
    getOutlets,
    outlets,
    loading: outletsLoading,
    error: outletsError,
  } = useOutlets();
  const [salesData, setSalesData] = useState<SalesReportData>({});
  const [filters, setFilters] = useState<SalesReportParams>({
    period: (initialPeriod as ReportPeriod) || "daily",
    startDate: initialStartDate,
    endDate: initialEndDate,
    outletId:
      userRole === "OUTLET_ADMIN" && userOutletId
        ? Number(userOutletId)
        : initialOutletId,
    page: initialPage,
    limit: initialLimit,
  });

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Reports", href: `/dashboard/${role}/reports` },
      { label: "Sales Report" },
    ]);
  }, [role, setBreadcrumbItems]);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        await getOutlets();
        console.log("Outlets dalam state:", outlets);
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
    const fetchSalesReport = async () => {
      try {
        if (filters.startDate && filters.endDate) {
          const result = await getSalesReport(filters);
          if (result && result.data) {
            setSalesData(result.data);
          }
        } else if (!filters.startDate && !filters.endDate) {
          const endDate = new Date().toISOString().split("T")[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

          // Update filters and URL
          const newFilters = { ...filters, startDate, endDate };
          setFilters(newFilters);

          // Update URL params
          const params = new URLSearchParams(window.location.search);
          params.set("startDate", startDate);
          params.set("endDate", endDate);

          // For OUTLET_ADMIN, ensure their outlet ID is in the URL
          if (userRole === "OUTLET_ADMIN" && userOutletId) {
            params.set("outletId", userOutletId);
          }

          router.push(`${window.location.pathname}?${params.toString()}`, {
            scroll: false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch sales report:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load sales report. Please try again.",
        });
      }
    };

    fetchSalesReport();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: SalesReportParams) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Get current outlet name if outletId is set
  const currentOutletName =
    outlets && filters.outletId
      ? outlets.find((o) => o.id === filters.outletId)?.outletName ||
        "All Outlets"
      : "All Outlets";

  // Configure export options
  const exportConfig: ExportConfig = {
    title: "Sales Report",
    period: filters.period,
    startDate: filters.startDate,
    endDate: filters.endDate,
    additionalInfo: {
      Outlet: currentOutletName,
      "Report Generated": new Date().toLocaleString(),
    },
    columnMapping: {
      key: "Date",
      value: "Sales Amount",
    },
    currencyColumns: ["value"], // Mark 'value' column to be formatted as IDR
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sales Report</h2>
        <ReportExportMenu
          data={salesData}
          config={exportConfig}
          chartRef={chartRef}
          isDisabled={loading}
        />
      </div>

      <ReportFilter
        outlets={outlets || []}
        showPeriodFilter={true}
        onFilterChange={handleFilterChange}
        userRole={userRole}
        userOutletId={userOutletId}
      />

      <div className="mt-6" ref={chartRef}>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            {currentOutletName} • {filters.period} data • {filters.startDate} to{" "}
            {filters.endDate}
          </h3>
          <SalesReportChart
            data={salesData}
            period={filters.period || "daily"}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
