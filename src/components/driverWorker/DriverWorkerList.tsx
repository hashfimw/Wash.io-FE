"use client";

import { useDriverWorker } from "@/hooks/api/driver-worker/useDriverWorker";
import { JobRecord, JobSortField } from "@/types/driverWorker";
import { TransportType } from "@/types/order";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { TableSkeleton } from "../ui/table-skeleton";
import { toLocalTimeString } from "@/utils/dateTime";
import { DateRange } from "react-day-picker";
import { Skeleton } from "../ui/skeleton";
import DriverWorkerTable from "./DriverWorkerTable";
import DriverWorkerFilters from "./DriverWorkerFilters";
import ZeroFilteredResult from "./ZeroFilteredResult";
import NullJob from "./NullJob";
import ErrorTable from "./ErrorTable";

export default function DriverWorkerList({
  endPoint,
  requestType,
}: {
  endPoint: "transport-jobs" | "laundry-jobs";
  requestType: "request" | "history";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = +(searchParams.get("page") || "1");
  const limit = searchParams.get("limit") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const sortOrder = searchParams.get("sortOrder") || "";
  const transportType = searchParams.get("transportType") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const [date, setDate] = useState<DateRange | undefined>();

  const [isNull, setIsNull] = useState<boolean>(false);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);

  const { loading: apiLoading, error, getJobs, checkIsNull } = useDriverWorker();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const loading = !!(pageLoading || apiLoading);
  const { toast } = useToast();

  const fetchJobs = async () => {
    const response = await getJobs({
      endPoint,
      requestType,
      page,
      limit: +limit,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      transportType: transportType as TransportType,
      startDate: date?.from?.toISOString(),
      endDate: date?.to?.toISOString(),
    });

    setJobs(response.data);
    setTotalPages(response.meta.total_pages);
    setTotalData(response.meta.total_data);
  };

  const fetchCheckIsNull = async () => {
    const response = await checkIsNull(endPoint, requestType);
    const isNull = !!response.data;

    setIsNull(!isNull);
  };

  useEffect(() => {
    setPageLoading(true);
    fetchCheckIsNull();
    setPageLoading(false);
  }, []);

  const updateUrlParams = (params: Record<string, string>) => {
    const url = new URL(window.location.href);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    router.push(url.pathname + url.search);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: page.toString() });
  };

  const handleLimitChange = (limit: string) => {
    updateUrlParams({
      limit,
      page: "1",
    });
  };

  const handleSort = (sortByInput: JobSortField) => {
    const direction = sortBy === sortByInput && sortOrder == "asc" ? "desc" : "asc";
    updateUrlParams({
      sortBy: sortByInput,
      sortOrder: direction,
    });
  };

  const handleTransportTypeChange = (transportType: TransportType) => {
    updateUrlParams({
      transportType,
      page: "1",
    });
  };

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    updateUrlParams({ startDate: startDate || "", endDate: endDate || "", page: "1" });
  };

  const handleResetFilters = () => {
    setDate(undefined);
    const url = new URL(window.location.href);
    url.search = "?page=1";
    router.push(url.pathname + url.search);
  };

  useEffect(() => {
    let startDate;
    let endDate;
    if (date?.from) startDate = toLocalTimeString(date.from);
    if (date?.to) endDate = toLocalTimeString(date.to);
    handleDateRangeChange(startDate, endDate);
  }, [date]);

  useEffect(() => {
    setPageLoading(true);
    fetchJobs();
    setPageLoading(false);
  }, [page, limit, sortOrder, transportType, startDate, endDate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  return (
    <div className="mx-auto p-3 space-y-6 max-w-screen-lg">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">{requestType === "request" ? "Job Requests" : "Jobs History"}</h1>
        <p className="text-muted-foreground">
          {requestType === "request" ? (
            loading ? (
              <Skeleton className="h-4 w-60 mt-2" />
            ) : (
              !error && `${totalData} job request(s) is available for you`
            )
          ) : (
            "View list of jobs handled by you"
          )}
        </p>
      </div>
      <div className={`${loading && "pointer-events-none"} sm:p-4 flex flex-col sm:bg-white sm:shadow sm:rounded-xl w-full`}>
        {!isNull && (
          <DriverWorkerFilters
            endPoint={endPoint}
            requestType={requestType}
            onFiltersReset={handleResetFilters}
            transportType={transportType}
            onTransportTypeChange={handleTransportTypeChange}
            limit={limit}
            onLimitChange={handleLimitChange}
            date={date}
            onDateChange={setDate}
          />
        )}
        {loading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : error ? (
          <ErrorTable errorMessage={error} />
        ) : isNull ? (
          <NullJob requestType={requestType} endPoint={endPoint} />
        ) : jobs.length === 0 ? (
          <ZeroFilteredResult />
        ) : (
          <DriverWorkerTable
            endPoint={endPoint}
            requestType={requestType}
            jobs={jobs}
            page={page}
            totalPages={totalPages}
            totalData={totalData}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onPageChange={handlePageChange}
            onSortChange={handleSort}
          />
        )}
      </div>
    </div>
  );
}
