"use client";

// File: app/dashboard/[role]/page.tsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardData, getDashboardData } from "@/services/dashboardService";
import DashboardContent from "@/components/admin/OverviewWrapper";

export default function DashboardPage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Get role from URL parameter
  const roleFromUrl = params?.role as string;

  // Debug info on component mount
  useEffect(() => {}, [roleFromUrl]);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the role from URL directly

      // Get dashboard data - always fetches fresh data
      const data = await getDashboardData(roleFromUrl);
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize dashboard on mount
  useEffect(() => {
    fetchDashboardData();
  }, [roleFromUrl]);

  // Common header component for all states
  const DashboardHeader = () => (
    <div className="bg-gradient-to-r from-birtu to-birmud rounded-lg p-4 sm:p-6 text-oren shadow-lg overflow-hidden">
      <div className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-putih">
            Welcome to Wash.io Laundry
          </h1>
          <p className="text-base sm:text-lg text-putbir opacity-90">
            Your all-in-one laundry management solution
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            variant="oren"
            size="sm"
            onClick={fetchDashboardData}
            className="hover:bg-birtu text-white border-white/20 mb-3 sm:mb-0"
          >
            <RefreshCw className="h-4 w-4 mr-2 animate-spin " />
            Refresh<span className="hidden lg:block">Data</span>
          </Button>
          <Waves className="h-10 w-10 sm:h-16 sm:w-16 text-birtu" />
        </div>
      </div>
    </div>
  );

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-full">
        <DashboardHeader />

        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-birtu mx-auto mb-3 sm:mb-4"></div>
            <p className="text-birtu text-sm sm:text-base">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-full">
        <DashboardHeader />

        <Card className="mx-auto max-w-md">
          <CardContent className="p-4 sm:p-6">
            <p className="text-center text-red-500 mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
            <div className="flex justify-center">
              <Button onClick={fetchDashboardData} className="text-sm sm:text-base">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render dashboard content if data is available
  return dashboardData ? (
    <DashboardContent
      dashboardData={dashboardData}
      userRoleForPath={roleFromUrl}
      onRefresh={fetchDashboardData}
    />
  ) : null;
}
