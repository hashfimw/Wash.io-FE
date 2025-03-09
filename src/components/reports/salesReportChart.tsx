// src/components/reports/SalesReportChart.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ReportPeriod, SalesReportData } from "@/types/reports";
import { SalesReportChartTabs } from "./salesReportChartTabs";
import { SalesReportKPICards } from "./salesReportKPICards";

interface SalesReportChartProps {
  data: SalesReportData;
  period: ReportPeriod;
  isLoading: boolean;
}

export function SalesReportChart({ data, period, isLoading }: SalesReportChartProps) {
  const [activeChart, setActiveChart] = useState<string>("bar");

  // Format number to currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Generate complete data for months and years
  const formatChartData = () => {
    let formattedData = [];

    if (period === "monthly") {
      // Get current year
      const currentYear = new Date().getFullYear();

      // Create all months for the current year
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      formattedData = monthNames.map((month, index) => {
        // Format key for lookup (e.g., "2023-01")
        const monthKey = `${currentYear}-${String(index + 1).padStart(2, "0")}`;

        return {
          name: `${month} ${currentYear}`,
          sales: data[monthKey] || 0,
        };
      });

      // For pie chart, filter out months with zero sales
      if (activeChart === "pie") {
        formattedData = formattedData.filter((item) => item.sales > 0);
      }
    } else if (period === "yearly") {
      // Get current year
      const currentYear = new Date().getFullYear();

      // Create array of years (current and 4 future years)
      formattedData = Array.from({ length: 5 }, (_, i) => {
        const year = currentYear + i;
        return {
          name: year.toString(),
          sales: data[year.toString()] || 0,
        };
      });

      // For pie chart, filter out years with zero sales
      if (activeChart === "pie") {
        formattedData = formattedData.filter((item) => item.sales > 0);
      }
    } else {
      // Daily data - format as before
      formattedData = Object.entries(data).map(([key, value]) => {
        const date = new Date(key);
        const label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return {
          name: label,
          date: key, // Store the full date for sorting
          sales: value,
        };
      });

      // Sort chronologically
      formattedData.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      // For pie chart, filter out days with zero sales
      if (activeChart === "pie") {
        formattedData = formattedData.filter((item) => item.sales > 0);
      }
    }

    return formattedData;
  };

  // KPI calculation
  const calculateKPIs = () => {
    const formattedData = formatChartData();

    const totalSales = formattedData.reduce((sum, item) => sum + item.sales, 0);
    const avgSales = formattedData.length > 0 ? totalSales / formattedData.length : 0;

    const highestSales =
      formattedData.length > 0
        ? formattedData.reduce((max, item) => (max.sales > item.sales ? max : item), formattedData[0])
        : { name: "N/A", sales: 0 };

    return { totalSales, avgSales, highestSales };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-4 bg-gray-200 rounded-full w-32 mb-2.5 mx-auto"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-md mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-sm"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              There is no sales data available for the selected filters. Try changing your date range or
              outlet selection.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatChartData();
  const kpis = calculateKPIs();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <SalesReportKPICards kpis={kpis} formatCurrency={formatCurrency} period={period} />

      {/* Chart Tabs */}
      <SalesReportChartTabs
        chartData={chartData}
        period={period}
        formatCurrency={formatCurrency}
        activeChart={activeChart}
        setActiveChart={setActiveChart}
      />
    </div>
  );
}
