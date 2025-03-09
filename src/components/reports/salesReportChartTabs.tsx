// src/components/reports/SalesReportChartTabs.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportPeriod } from "@/types/reports";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

interface ChartDataItem {
  name: string;
  sales: number;
  date?: string;
}

interface SalesReportChartTabsProps {
  chartData: ChartDataItem[];
  period: ReportPeriod;
  formatCurrency: (value: number) => string;
  activeChart: string;
  setActiveChart: Dispatch<SetStateAction<string>>;
}

export function SalesReportChartTabs({
  chartData,
  period,
  formatCurrency,
  activeChart,
  setActiveChart,
}: SalesReportChartTabsProps) {
  // Colors for charts
  const COLORS = ["#73A5A8", "#E5843F", "#97cfcf", "#F6BD60", "#84A59D"];

  // Detect if mobile view - will be used for responsive adjustments
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  // Add window resize listener to update isMobile state
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Tabs value={activeChart} onValueChange={setActiveChart}>
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
        <TabsTrigger value="bar">Bar Chart</TabsTrigger>
        <TabsTrigger value="area">Area Chart</TabsTrigger>
        <TabsTrigger value="pie">Distribution</TabsTrigger>
      </TabsList>

      {/* Bar Chart */}
      <TabsContent value="bar">
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
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 70,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#CCF5F5" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fill="#000"
                    stroke="#73A5A8"
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("id-ID", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                    fill="#000"
                    stroke="#73A5A8"
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#FCFCFC",
                      borderColor: "#CCF5F5",
                    }}
                    labelStyle={{ color: "#000" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar
                    dataKey="sales"
                    name="Sales"
                    fill="#E5843F"
                    stroke="#73A5A8"
                    radius={[4, 4, 0, 0]}
                    strokeWidth={1}
                    activeBar={{ fill: "#73A5A8", stroke: "#73A5A8" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Area Chart */}
      <TabsContent value="area">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Sales Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 70,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#CCF5F5" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fill="#000"
                    stroke="#73A5A8"
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("id-ID", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(value)
                    }
                    fill="#000"
                    stroke="#73A5A8"
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#FCFCFC",
                      borderColor: "#CCF5F5",
                    }}
                    labelStyle={{ color: "#000" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#E5843F"
                    fill="#E5843F"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Pie Chart */}
      <TabsContent value="pie">
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="sales"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? "50%" : "60%"}
                    innerRadius="0%"
                    fill="#8884d8"
                    label={({ name, sales, percent }) => {
                      // Responsif label yang menyesuaikan ukuran layar
                      return isMobile ? `${percent.toFixed(0)}%` : `${name}: ${formatCurrency(sales)}`;
                    }}
                    labelLine={!isMobile}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend
                    layout={isMobile ? "horizontal" : "vertical"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    align={isMobile ? "center" : "right"}
                    wrapperStyle={isMobile ? { paddingTop: "20px" } : {}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
