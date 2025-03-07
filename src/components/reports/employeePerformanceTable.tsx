"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { EmployeePerformanceData } from "@/types/reports";
import SwipeIndicator from "../swipeIndicator";

interface EmployeePerformanceTableProps {
  data: EmployeePerformanceData;
  isLoading: boolean;
  onTabChange?: (tab: "workers" | "drivers") => void;
}

export function EmployeePerformanceTable({ data, isLoading, onTabChange }: EmployeePerformanceTableProps) {
  const [activeTab, setActiveTab] = useState<"workers" | "drivers">("workers");
  const [searchQuery, setSearchQuery] = useState("");

  // Handler untuk perubahan tab
  const handleTabChange = (tab: "workers" | "drivers") => {
    setActiveTab(tab);
    // Panggil onTabChange jika prop tersedia
    onTabChange && onTabChange(tab);
  };

  // Filter workers based on search query
  const filteredWorkers =
    data.workers?.filter(
      (worker) =>
        worker.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.outletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.station.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Filter drivers based on search query
  const filteredDrivers =
    data.drivers?.filter(
      (driver) =>
        driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.outletName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Get badge for worker station
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
          <CardTitle>Employee Performance</CardTitle>
          <CardDescription>View the total jobs handled by each employee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded-md w-full max-w-md"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const noWorkersData = !data.workers || data.workers.length === 0 || filteredWorkers.length === 0;
  const noDriversData = !data.drivers || data.drivers.length === 0 || filteredDrivers.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Performance</CardTitle>
        <CardDescription>View the total jobs handled by each employee</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as "workers" | "drivers")}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <TabsList>
              <TabsTrigger value="workers">Workers</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
            </TabsList>

            <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <TabsContent value="workers">
            {noWorkersData ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Worker Data Available</AlertTitle>
                <AlertDescription>
                  There is no worker performance data available for the selected filters.
                  {searchQuery && " Try clearing your search query."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <SwipeIndicator className="md:hidden" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker Name</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead className="text-right">Total Jobs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkers.map((worker) => (
                      <TableRow key={worker.workerId}>
                        <TableCell className="font-medium">{worker.workerName}</TableCell>
                        <TableCell>{worker.outletName}</TableCell>
                        <TableCell>{getStationBadge(worker.station)}</TableCell>
                        <TableCell className="text-right">{worker.totalJobs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="drivers">
            {noDriversData ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Driver Data Available</AlertTitle>
                <AlertDescription>
                  There is no driver performance data available for the selected filters.
                  {searchQuery && " Try clearing your search query."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <SwipeIndicator className="md:hidden" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver Name</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead className="text-right">Total Jobs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver) => (
                      <TableRow key={driver.driverId}>
                        <TableCell className="font-medium">{driver.driverName}</TableCell>
                        <TableCell>{driver.outletName}</TableCell>
                        <TableCell className="text-right">{driver.totalJobs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
