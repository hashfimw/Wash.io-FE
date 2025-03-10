import { SalesReportClient } from "@/components/reports/SalesReportClient";
import { BreadcrumbProvider } from "@/context/BreadcrumbContext";

export default function SalesReportPage({
  params,
  searchParams,
}: {
  params: { role: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const role = params.role;
  const period = (searchParams.period as string) || "daily";
  const startDate = searchParams.startDate as string;
  const endDate = searchParams.endDate as string;
  const outletId = searchParams.outletId ? Number(searchParams.outletId) : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const limit = searchParams.limit ? Number(searchParams.limit) : 100;

  return (
    <BreadcrumbProvider>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground">View and analyze sales data across different time periods.</p>
        </div>

        <SalesReportClient
          role={role}
          initialPeriod={period}
          initialStartDate={startDate}
          initialEndDate={endDate}
          initialOutletId={outletId}
          initialPage={page}
          initialLimit={limit}
        />
      </div>
    </BreadcrumbProvider>
  );
}
