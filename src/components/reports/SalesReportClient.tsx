"use client";

// src/components/reports/SalesReportClient.tsx
import { useEffect, useState } from "react";
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
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SalesReportChart } from "./salesReportChart";
import { ReportFilter } from "./reportFilter";

interface SalesReportClientProps {
  role: string;
  initialPeriod: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialOutletId?: number;
  initialPage: number;
  initialLimit: number;
}

export function SalesReportClient({
  role,
  initialPeriod,
  initialStartDate,
  initialEndDate,
  initialOutletId,
  initialPage,
  initialLimit,
}: SalesReportClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { setBreadcrumbItems } = useBreadcrumb();

  // API hooks
  const { getSalesReport, loading, error: reportError } = useReports();
  const {
    getOutlets,
    outlets,
    loading: outletsLoading,
    error: outletsError,
  } = useOutlets();

  // State
  const [salesData, setSalesData] = useState<SalesReportData>({});
  const [filters, setFilters] = useState<SalesReportParams>({
    period: (initialPeriod as ReportPeriod) || "daily",
    startDate: initialStartDate,
    endDate: initialEndDate,
    outletId: initialOutletId,
    page: initialPage,
    limit: initialLimit,
  });

  // Set breadcrumb
  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Reports", href: `/dashboard/${role}/reports` },
      { label: "Sales Report" },
    ]);
  }, [role, setBreadcrumbItems]);

  // Fetch outlets on component mount
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

  // Fetch sales report when filters change
  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        // Only fetch if we have date range
        if (filters.startDate && filters.endDate) {
          const result = await getSalesReport(filters);
          if (result && result.data) {
            setSalesData(result.data);
          }
        } else if (!filters.startDate && !filters.endDate) {
          // If no date range, set default (last 30 days)
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

  // Handle export to CSV
  const handleExport = () => {
    // Format data for CSV
    const csvRows = [
      ["Date", "Sales Amount"],
      ...Object.entries(salesData).map(([date, amount]) => [
        date,
        amount.toString(),
      ]),
    ];

    // Convert to CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((row) => row.join(",")).join("\n");

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sales_report_${filters.period}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);

    // Trigger download and cleanup
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

  return (
    <>
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={loading || Object.keys(salesData).length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <ReportFilter
        outlets={outlets || []}
        showPeriodFilter={true}
        onFilterChange={handleFilterChange}
      />

      <SalesReportChart
        data={salesData}
        period={filters.period || "daily"}
        isLoading={loading}
      />
    </>
  );
}
