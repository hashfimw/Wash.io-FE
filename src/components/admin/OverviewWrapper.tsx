"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Waves, BarChart, Shirt, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { DashboardData } from "@/services/dashboardService";

function PendingOrdersCard({ count, userRoleForPath }: { count: number; userRoleForPath: string }) {
  return (
    <Link href={`/dashboard/${userRoleForPath}/orders/process`} className="block h-full">
      <Card className="hover:shadow-md transition-shadow hover:bg-gray-50 cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
          <Users className="h-6 w-6 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-xs text-orange-600">{count > 0 ? "Need attention" : "All caught up!"}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TodayOrdersCard({ count, userRoleForPath }: { count: number; userRoleForPath: string }) {
  return (
    <Link href={`/dashboard/${userRoleForPath}/orders`} className="block h-full">
      <Card className="hover:shadow-md transition-shadow hover:bg-gray-50 cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Today&apos;s Orders</CardTitle>
          <Users className="h-6 w-6 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-xs text-indigo-600">Today&apos;s activity</p>
        </CardContent>
      </Card>
    </Link>
  );
}

interface DashboardContentProps {
  dashboardData: DashboardData;
  userRoleForPath: string;
  onRefresh: () => Promise<void>;
}

export default function DashboardContent({
  dashboardData,
  userRoleForPath,
  onRefresh,
}: DashboardContentProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isSuperAdmin = userRoleForPath === "super-admin";
  const isOutletAdmin = userRoleForPath === "outlet-admin";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: "Dashboard refreshed",
        description: "Dashboard data has been updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not update dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getOutletDisplay = () => {
    if (!isOutletAdmin) {
      return dashboardData.outletsCount;
    }
    return dashboardData.outletName || "Wash.io Outlet";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="bg-gradient-to-r from-birtu to-birmud rounded-lg p-6 text-oren shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-putih">Welcome to Wash.io Laundry</h1>
            <p className="text-lg text-putbir opacity-90">Your all-in-one laundry management solution</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="oren"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="hover:bg-birtu text-white border-white/20 mb-3 sm:mb-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh<span className="hidden lg:block">Data</span>
            </Button>
            <Waves className="h-16 w-16 text-birtu" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="h-full">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isSuperAdmin ? "Active Outlets" : "Your Outlet"}
              </CardTitle>
              <Store className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent className="flex flex-col justify-between">
              <div className="text-2xl font-bold" title={String(getOutletDisplay())}>
                {getOutletDisplay()}
              </div>
              {isSuperAdmin && (
                <p className="text-xs text-green-600">+{dashboardData.newOutletsThisMonth} this month</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="h-full">
          <Card className="hover:shadow-md transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
              <Users className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.customersCount}</div>
              <p className="text-xs text-green-600">+{dashboardData.newCustomersThisMonth} new customers</p>
            </CardContent>
          </Card>
        </div>

        <PendingOrdersCard count={dashboardData.pendingOrdersCount} userRoleForPath={userRoleForPath} />

        <TodayOrdersCard count={dashboardData.todayOrdersCount} userRoleForPath={userRoleForPath} />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href={`/dashboard/${userRoleForPath}/orders`}>
              <Button variant="outline">
                <Shirt className="mr-2 h-4 w-4" /> New Order
              </Button>
            </Link>
            <Link href={`/dashboard/${userRoleForPath}/outlets`}>
              <Button variant="outline">
                <Store className="mr-2 h-4 w-4" /> Manage Outlets
              </Button>
            </Link>
            <Link href={`/dashboard/${userRoleForPath}/employees`}>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" /> Employee Management
              </Button>
            </Link>
            <Link href={`/dashboard/${userRoleForPath}/reports/sales`}>
              <Button variant="outline">
                <BarChart className="mr-2 h-4 w-4" /> Sales Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
