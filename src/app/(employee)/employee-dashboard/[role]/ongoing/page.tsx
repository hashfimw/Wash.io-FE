"use client";

import Cloud from "@/components/driverWorker/Cloud";
import ErrorTable from "@/components/driverWorker/ErrorTable";
import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useDriverWorker } from "@/hooks/api/driver-worker/useDriverWorker";
import { Bike, CircleHelp, LoaderCircle, WashingMachine } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployeeOngoingJobPage() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();

  const { setBreadcrumbItems } = useBreadcrumb();

  const { loading: apiLoading, error, getOngoingJob } = useDriverWorker();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const loading = !!(pageLoading || apiLoading);

  const fetchOngoingId = async () => {
    setPageLoading(true);
    const response = await getOngoingJob(role === "driver" ? "transport-jobs" : "laundry-jobs");

    const id = response.data;
    if (id) router.push(`/employee-dashboard/${role}/${id}`);
    setPageLoading(false);
  };

  useEffect(() => {
    fetchOngoingId();
  }, []);

  useEffect(() => {
    const roleName = role === "driver" ? "Driver" : "Worker";
    setBreadcrumbItems([{ label: roleName, href: `/employee-dashboard/${role}` }, { label: "Ongoing Job" }]);
  }, [role, setBreadcrumbItems]);

  if (loading) {
    return (
      <div className="flex flex-col items-center place-content-center size-full">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto p-3 space-y-6 max-w-screen-lg">
      <div className="sm:p-4 flex flex-col sm:bg-white sm:shadow sm:rounded-xl w-full">
        {error ? (
          <ErrorTable errorMessage={error} />
        ) : (
          <div className="size-full flex flex-col items-center place-content-center py-12 max-w-[480px] mx-auto gap-3">
            <div className="relative size-36 opacity-50 mb-2">
              <Cloud className="absolute -top-6 size-44 scale-x-[-1] fill-birtu/50" />
              <Cloud className="absolute -top-2 -left-8 size-48 rotate-[168deg] fill-birmud" />{" "}
              <Bike className="absolute size-32 -left-10 text-oren brightness-50 -rotate-[30deg]" />
              <WashingMachine className="absolute size-32 bottom-0 -right-8 text-birtu brightness-50 rotate-12" />
              <CircleHelp className="absolute -bottom-4 left-[27px] size-20 text-red-700 stroke-[3] animate-bounce" />
            </div>
            <p className="text-xl font-semibold text-black/75">Idle employee detected</p>
            <p className="text-muted-foreground font-medium text-center mb-2">
              You are not assigned to a job right now! Check out the job requests page below.
            </p>
            <Button
              onClick={() => router.push(`/employee-dashboard/${role}/requests`)}
              variant="outline"
              className="bg-birtu text-white hover:text-white transition hover:bg-oren rounded-lg border-0"
            >
              Go to Job Requests
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
