import { EmployeePerformanceClient } from "@/components/reports/EmployeePerformanceClient";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

export default function EmployeePerformancePage({
  params,
  searchParams,
}: {
  params: { role: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const role = params.role;
  const startDate = searchParams.startDate as string;
  const endDate = searchParams.endDate as string;
  const outletId = searchParams.outletId ? Number(searchParams.outletId) : undefined;

  return (
    <BreadcrumbProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Employee Performance</h1>
          <p className="text-muted-foreground">Track and analyze the performance of workers and drivers.</p>
        </div>

        <EmployeePerformanceClient
          role={role}
          initialStartDate={startDate}
          initialEndDate={endDate}
          initialOutletId={outletId}
        />
      </div>
    </BreadcrumbProvider>
  );
}
