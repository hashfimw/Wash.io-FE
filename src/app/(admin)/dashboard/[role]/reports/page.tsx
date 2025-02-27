// src/app/dashboard/[role]/reports/page.tsx
import Link from "next/link";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartBar, Users } from "lucide-react";

// Server Component
export default function ReportsIndexPage({
  params,
}: {
  params: { role: string };
}) {
  const role = params.role;

  return (
    <BreadcrumbProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analysis
          </h1>
          <p className="text-muted-foreground">
            Access detailed reports and analytics for your laundry business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Report Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Sales Report</CardTitle>
              <ChartBar className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="min-h-[60px]">
                View and analyze sales data, including income reports by day,
                month, or year.
                {role === "super-admin" &&
                  " Filter by outlet to see specific performance."}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Link
                href={`/dashboard/${role}/reports/sales`}
                className="w-full"
              >
                <Button className="w-full">View Sales Report</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Employee Performance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                Employee Performance
              </CardTitle>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="min-h-[60px]">
                Track the performance of workers and drivers, including total
                jobs completed.
                {role === "super-admin" &&
                  " Get insights across all outlets or filter by specific outlet."}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Link
                href={`/dashboard/${role}/reports/employee-performance`}
                className="w-full"
              >
                <Button className="w-full">View Employee Performance</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
