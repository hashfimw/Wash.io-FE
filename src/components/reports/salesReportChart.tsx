// src/components/reports/SalesReportChart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportPeriod, SalesReportData } from "@/types/reports";

interface SalesReportChartProps {
  data: SalesReportData;
  period: ReportPeriod;
  isLoading: boolean;
}

export function SalesReportChart({
  data,
  period,
  isLoading,
}: SalesReportChartProps) {
  // Generate complete data for months and years
  let formattedData = [];

  if (period === "monthly") {
    // Get current year
    const currentYear = new Date().getFullYear();

    // Create all months for the current year
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    formattedData = monthNames.map((month, index) => {
      // Format key for lookup (e.g., "2023-01")
      const monthKey = `${currentYear}-${String(index + 1).padStart(2, "0")}`;

      return {
        name: `${month} ${currentYear}`,
        sales: data[monthKey] || 0,
      };
    });
  } else if (period === "yearly") {
    // Get current year and show 5 years FORWARD (current + 4 future years)
    const currentYear = new Date().getFullYear();

    // Create array of years (current year and 4 years ahead)
    formattedData = Array.from({ length: 5 }, (_, i) => {
      const year = currentYear + i;
      return {
        name: year.toString(),
        sales: data[year.toString()] || 0,
      };
    });
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
        sales: value,
      };
    });

    // Sort chronologically
    formattedData.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }

  // Format number to currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
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
              There is no sales data available for the selected filters. Try
              changing your date range or outlet selection.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {period === "daily" && "Daily Sales Report"}
          {period === "monthly" && "Monthly Sales Report"}
          {period === "yearly" && "Yearly Sales Report"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-birmud" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                className="fill-birtu stroke-birtu"
              />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
                className="fill-birtu stroke-birtu"
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: "#FCFCFC", // putih
                  borderColor: "#CCF5F5", // birmud
                }}
                labelStyle={{ color: "#73A5A8" }} // birtu
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar
                dataKey="sales"
                name="Sales"
                fill="#E5843F" // oren
                stroke="#73A5A8" // birtu
                radius={[4, 4, 0, 0]}
                strokeWidth={1}
                activeBar={{ fill: "#73A5A8", stroke: "#73A5A8" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
