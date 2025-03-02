"use client";

import { useDriverWorker } from "@/hooks/api/driver-worker/useDriverWorker";
import { JobRecord } from "@/types/driverWorker";
import { TransportType } from "@/types/order";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { TableSkeleton } from "../ui/table-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import TimeDifferenceTooltip from "../notification/TimeDifferenceTooltip";
import { toLocalTimeString, toUTCtime } from "@/utils/dateTime";
import { TablePagination } from "../shared/usePagination";
import { Badge } from "../ui/badge";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "../attendances/DateRangePicker";
import { Button } from "../ui/button";
import { ListRestart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function DriverWorkerTable({
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
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") || "";
  const transportType = searchParams.get("transportType") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const [date, setDate] = useState<DateRange | undefined>();

  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [totalPages, setTotalPage] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);

  const { loading, error, getJobs } = useDriverWorker();
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
    setTotalPage(response.meta.total_pages);
    setTotalData(response.meta.total_data);
  };

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
      limit: limit,
      page: "1",
    });
  };

  const handleSortOrderChange = (sortOrder: "asc" | "desc") => {
    updateUrlParams({
      sortOrder,
      page: "1",
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
    if (!error) {
      fetchJobs();
    }
  }, [date]);
  console.log(date);

  useEffect(() => {
    if (!error) {
      fetchJobs();
    }
  }, [page, sortOrder, transportType, limit]);

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
    <div className="mx-auto p-3 sm:p-6 space-y-6 max-w-screen-lg">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Job History</h1>
        <p className="text-muted-foreground">View list of jobs handled by you</p>
      </div>
      <div className="sm:p-4 space-y-3 sm:bg-white sm:shadow sm:rounded-xl w-full">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-base">Filters</p>
          <Button variant="outline" size="sm" className="text-sm w-fit" onClick={handleResetFilters}>
            <ListRestart />
            Reset filters
          </Button>
        </div>
        {requestType === "request" ? (
          <div className="flex justify-between">
            {endPoint === "transport-jobs" ? (
              <Select value={transportType} onValueChange={handleTransportTypeChange}>
                <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                  <SelectValue placeholder="Transport Type" />
                </SelectTrigger>
                <SelectContent className="font-medium">
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <></>
            )}
            <Select value={limit} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent className="font-medium">
                {[5, 10, 15, 20].map((limit, idx) => (
                  <SelectItem key={idx} value={limit.toString()}>
                    {limit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="font-medium flex gap-3 flex-wrap justify-center md:justify-normal flex-col md:flex-row">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Select value={sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Sort date" />
              </SelectTrigger>
              <SelectContent className="font-medium">
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
            {endPoint === "transport-jobs" ? (
              <Select value={transportType} onValueChange={handleTransportTypeChange}>
                <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                  <SelectValue placeholder="Transport Type" />
                </SelectTrigger>
                <SelectContent className="font-medium">
                  <SelectItem value="PICKUP">Pickup</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <></>
            )}
            <Select value={limit} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-fit border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent className="font-medium">
                {[5, 10, 15, 20].map((limit, idx) => (
                  <SelectItem key={idx} value={limit.toString()}>
                    {limit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {error ? (
          <>Error</>
        ) : loading ? (
          <TableSkeleton columns={4} rows={10} />
        ) : jobs.length === 0 ? (
          <>No data</>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <p className="text-muted-foreground place-self-start translate-y-1">
              Click on the table row to {requestType === "request" ? "process the job." : "access the job's detail."}
            </p>
            <div className="rounded-md border text-center w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-center font-semibold">Date</TableHead>
                    {endPoint === "transport-jobs" ? <TableHead className="text-center font-semibold">Transport Type</TableHead> : <></>}
                    <TableHead className="text-center font-semibold">Job Id</TableHead>
                    <TableHead className="text-center font-semibold">Order Id</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job, idx) => (
                    <TableRow
                      key={idx}
                      onClick={() => router.push(`/employee-dashboard/${endPoint === "transport-jobs" ? "driver" : "worker"}/${job.id}`, {})}
                      className="group hover:cursor-pointer hover:underline hover:font-medium hover:text-birtu transition"
                    >
                      <TableCell className="min-w-48">
                        {requestType == "request" ? (
                          <>
                            <TimeDifferenceTooltip date={job.date} />
                          </>
                        ) : (
                          <p>{new Date(job.date).toLocaleString()}</p>
                        )}
                      </TableCell>
                      {endPoint === "transport-jobs" ? (
                        <TableCell className="min-w-32">
                          <Badge variant={`${job.transportType === "PICKUP" ? "badgebirtu" : "badgeoren"}`} className="rounded-lg">
                            {job.transportType === "PICKUP" ? "Pickup" : "Delivery"}
                          </Badge>
                        </TableCell>
                      ) : (
                        <></>
                      )}
                      <TableCell className="min-w-24">{"#" + job.id}</TableCell>
                      <TableCell className="min-w-24">{"#" + job.orderId}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow></TableRow>
                </TableBody>
              </Table>
            </div>
            <p>
              Showing {jobs.length} out of {totalData} job(s)
            </p>
            {totalPages > 1 ? <TablePagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} /> : <></>}
          </div>
        )}
      </div>
    </div>
  );
}
