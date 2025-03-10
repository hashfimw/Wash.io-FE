"use client";

import { useState } from "react";
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
  Cell,
  Pie,
  PieChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface WorkerPerformance {
  workerId: number;
  workerName: string;
  outletName: string;
  station: string;
  totalJobs: number;
}

interface DriverPerformance {
  driverId: number;
  driverName: string;
  outletName: string;
  totalJobs: number;
}

interface TopWorkerData {
  name: string;
  totalJobs: number;
  outlet: string;
  station: string;
}

interface TopDriverData {
  name: string;
  totalJobs: number;
  outlet: string;
}

interface EmployeePerformanceData {
  workers: WorkerPerformance[];
  drivers: DriverPerformance[];
}

interface EmployeePerformanceChartProps {
  data: EmployeePerformanceData;
  activeTab: "workers" | "drivers";
  isLoading: boolean;
}

export function EmployeePerformanceChart({ data, activeTab, isLoading }: EmployeePerformanceChartProps) {
  const [chartType, setChartType] = useState<string>("bar");

  const calculateWorkerMetrics = () => {
    const stationGroups = data.workers.reduce((acc, worker) => {
      const station = worker.station || "Unknown";
      if (!acc[station]) {
        acc[station] = {
          station,
          totalJobs: 0,
          workerCount: 0,
        };
      }
      acc[station].totalJobs += worker.totalJobs;
      acc[station].workerCount += 1;
      return acc;
    }, {} as Record<string, { station: string; totalJobs: number; workerCount: number }>);

    const stationData = Object.values(stationGroups).map((group) => ({
      name: group.station,
      value: group.totalJobs,
      count: group.workerCount,
      avg: group.workerCount > 0 ? Math.round(group.totalJobs / group.workerCount) : 0,
    }));

    const topWorkers = [...data.workers]
      .sort((a, b) => b.totalJobs - a.totalJobs)
      .slice(0, 5)
      .map(
        (worker) =>
          ({
            name: worker.workerName,
            totalJobs: worker.totalJobs,
            outlet: worker.outletName,
            station: worker.station,
          } as TopWorkerData)
      );

    return { stationData, topWorkers };
  };

  const calculateDriverMetrics = () => {
    const outletGroups = data.drivers.reduce((acc, driver) => {
      const outlet = driver.outletName;
      if (!acc[outlet]) {
        acc[outlet] = {
          outlet,
          totalJobs: 0,
          driverCount: 0,
        };
      }
      acc[outlet].totalJobs += driver.totalJobs;
      acc[outlet].driverCount += 1;
      return acc;
    }, {} as Record<string, { outlet: string; totalJobs: number; driverCount: number }>);

    const outletData = Object.values(outletGroups).map((group) => ({
      name: group.outlet,
      value: group.totalJobs,
      count: group.driverCount,
      avg: group.driverCount > 0 ? Math.round(group.totalJobs / group.driverCount) : 0,
    }));

    const topDrivers = [...data.drivers]
      .sort((a, b) => b.totalJobs - a.totalJobs)
      .slice(0, 5)
      .map(
        (driver) =>
          ({
            name: driver.driverName,
            totalJobs: driver.totalJobs,
            outlet: driver.outletName,
          } as TopDriverData)
      );

    return { outletData, topDrivers };
  };

  const getStationBadge = (station: string) => {
    switch (station) {
      case "WASHING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Washing
          </Badge>
        );
      case "IRONING":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Ironing
          </Badge>
        );
      case "PACKING":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Packing
          </Badge>
        );
      default:
        return <Badge variant="outline">{station}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="h-4 bg-gray-200 rounded-full w-32 mb-2.5 mx-auto"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-md mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full max-w-sm"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const noWorkersData = !data.workers || data.workers.length === 0;
  const noDriversData = !data.drivers || data.drivers.length === 0;

  if ((activeTab === "workers" && noWorkersData) || (activeTab === "drivers" && noDriversData)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              There is no {activeTab === "workers" ? "worker" : "driver"} performance data available for the
              selected filters.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ["#73A5A8", "#E5843F", "#97cfcf", "#F6BD60", "#84A59D"];

  const { stationData, topWorkers } = calculateWorkerMetrics();
  const { outletData, topDrivers } = calculateDriverMetrics();

  const chartData =
    activeTab === "workers"
      ? chartType === "distribution"
        ? stationData
        : topWorkers
      : chartType === "distribution"
      ? outletData
      : topDrivers;

  const employeeData =
    activeTab === "workers" ? (topWorkers as TopWorkerData[]) : (topDrivers as TopDriverData[]);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={chartType} onValueChange={setChartType}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
            <TabsTrigger value="bar">Top Performers</TabsTrigger>
            <TabsTrigger value="distribution">Job Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeTab === "workers" ? topWorkers : topDrivers}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 50, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#CCF5F5" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value} jobs`, "Total Jobs"]}
                    contentStyle={{
                      backgroundColor: "#FCFCFC",
                      borderColor: "#CCF5F5",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalJobs" name="Total Jobs" fill="#E5843F">
                    {(activeTab === "workers" ? topWorkers : topDrivers).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {employeeData.map((employee, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">
                      {employee.outlet}{" "}
                      {activeTab === "workers" && (
                        <span className="ml-1">{getStationBadge((employee as TopWorkerData).station)}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-birmud/20 ml-2">
                    {employee.totalJobs} jobs
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeTab === "workers" ? stationData : outletData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="60%"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(activeTab === "workers" ? stationData : outletData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} jobs`, "Total Jobs"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {(activeTab === "workers" ? stationData : outletData).map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.count} {activeTab === "workers" ? "workers" : "drivers"}
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span>Total: {item.value} jobs</span>
                    <span className="text-xs">Avg: {item.avg}/person</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
