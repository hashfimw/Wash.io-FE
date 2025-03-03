"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import TimeDifferenceTooltip from "../notification/TimeDifferenceTooltip";
import { TablePagination } from "../shared/usePagination";
import { JobRecord, JobSortField } from "@/types/driverWorker";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

interface DriverWorkerTableProps {
  endPoint: string;
  requestType: string;
  jobs: JobRecord[];
  page: number;
  totalPages: number;
  totalData: number;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortByInput: JobSortField) => void;
  onPageChange: (page: number) => void;
}

export default function DriverWorkerTable({
  endPoint,
  requestType,
  jobs,
  page,
  totalPages,
  totalData,
  sortBy,
  sortOrder,
  onSortChange: handleSortChange,
  onPageChange: handlePageChange,
}: DriverWorkerTableProps) {
  const sortOrderSymbol = (sortByInput: JobSortField) => {
    if (sortBy == sortByInput) {
      if (sortOrder == "asc") return " ↑";
      else return " ↓";
    } else return "";
  };
  const router = useRouter();

  return (
    <div className="flex flex-col items-center space-y-3">
      <p className="text-muted-foreground place-self-start translate-y-1 text-sm">
        Click on the table row to {requestType === "request" ? "process the job." : "access the job's detail."}
      </p>
      <div className="rounded-md border text-center w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted hover:cursor-pointer">
              <TableHead onClick={() => handleSortChange("date")} className="text-center font-semibold hover:bg-neutral-200 transition">
                Date{sortOrderSymbol("date")}
              </TableHead>
              {endPoint === "transport-jobs" && (
                <>
                  <TableHead onClick={() => handleSortChange("transportType")} className="text-center font-semibold hover:bg-neutral-200 transition">
                    Transport Type{sortOrderSymbol("transportType")}
                  </TableHead>
                  <TableHead onClick={() => handleSortChange("distance")} className="text-center font-semibold hover:bg-neutral-200 transition">
                    Distance{sortOrderSymbol("distance")}
                  </TableHead>
                </>
              )}
              <TableHead onClick={() => handleSortChange("id")} className="text-center font-semibold hover:bg-neutral-200 transition">
                Job Id{sortOrderSymbol("id")}
              </TableHead>
              <TableHead onClick={() => handleSortChange("orderId")} className="text-center font-semibold hover:bg-neutral-200 transition">
                Order Id{sortOrderSymbol("orderId")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job, idx) => (
              <TableRow
                key={idx}
                onClick={() => router.push(`/employee-dashboard/${endPoint === "transport-jobs" ? "driver" : "worker"}/${job.id}`, {})}
                className="group hover:cursor-pointer hover:underline hover:font-medium hover:text-birtu transition h-14 sm:h-10"
              >
                <TableCell className="min-w-48">
                  {requestType == "request" ? <TimeDifferenceTooltip date={job.date} /> : <p>{new Date(job.date).toLocaleString()}</p>}
                </TableCell>
                {endPoint === "transport-jobs" && (
                  <>
                    <TableCell className="min-w-32">
                      <Badge variant={`${job.transportType === "PICKUP" ? "badgebirtu" : "badgeoren"}`} className="rounded-lg">
                        {job.transportType === "PICKUP" ? "Pickup" : "Delivery"}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-24">{job.distance + " km"}</TableCell>
                  </>
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
      {totalPages > 1 && <TablePagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}
    </div>
  );
}
