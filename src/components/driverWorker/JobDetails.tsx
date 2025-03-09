"use client";

import { useDriverWorker } from "@/hooks/api/driver-worker/useDriverWorker";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { GetJobByIdResponse, UpdateLaundryJobInputBody } from "@/types/driverWorker";
import { Button } from "../ui/button";
import ProcessModal from "./ProcessModal";
import validateOrderItemInputs from "./validateTakeLaundryJobSchema";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import ErrorTable from "./ErrorTable";
import JobDetailsCard from "./JobDetailsCard";
import { Dialog, DialogContent } from "../ui/dialog";
import { BypassRequestForm } from "../bypass/bypassRequestForm";
import { EmployeeWorkShift, WorkerStation } from "@/types/employee";
import { AlertCircle } from "lucide-react";
import { useAttendance } from "@/hooks/api/attendances/useAttendance";
import { GetEmployeeStatusResponse } from "@/types/attendance";
import { useRouter } from "next/navigation";

export default function JobDetails({ role, id }: { role: "driver" | "worker"; id: string }) {
  const router = useRouter();

  const { getJobById, updateJob: alterJob, loading: apiLoading, error } = useDriverWorker();
  const [job, setJob] = useState<GetJobByIdResponse>();

  const { getEmployeeStatus } = useAttendance();
  const [employeeStatus, setEmployeeStatus] = useState<GetEmployeeStatusResponse>({
    canClockIn: false,
    isAttended: false,
    isOnWorkShift: false,
    isPresent: false,
    isWorking: false,
    shiftStart: new Date().toString(),
    workShift: "MORNING" as EmployeeWorkShift,
  });

  const [inputBody, setInputBody] = useState<UpdateLaundryJobInputBody[]>([]);
  const [inputRef, setInputRef] = useState<UpdateLaundryJobInputBody[]>([]);
  const [orderItemNames, setOrderItemNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const [isAlertOpen, setAlertOpen] = useState<boolean>(false);
  const [isFormOpen, setFormOpen] = useState<boolean>(false);

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const loading = !!(pageLoading || apiLoading);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchJob = async () => {
    setPageLoading(true);
    const response = await getJobById(role === "driver" ? "transport-jobs" : "laundry-jobs", +id);

    if (response.orderItem) {
      if (response.orderItem.length > 0) {
        const itemNames: string[] = [];
        const orderItems = response.orderItem.map((item) => {
          itemNames.push(item.orderItemName);
          return {
            orderItemId: item.id,
            qty: item.qty,
          };
        });
        const defaultItems = orderItems.map((item) => ({
          orderItemId: item.orderItemId,
          qty: null,
        }));
        setOrderItemNames(itemNames);
        setInputRef(orderItems);
        setInputBody(defaultItems);
      }
    }
    setJob(response);
    setPageLoading(false);
  };

  const fetchEmployeeStatus = async () => {
    setPageLoading(true);
    const response = await getEmployeeStatus();

    setEmployeeStatus(response.data);
    setPageLoading(false);
  };

  const updateJob = async () => {
    setAlertOpen(false);
    setPageLoading(true);
    setIsSuccess(false);
    const response = await alterJob(role === "driver" ? "transport-jobs" : "laundry-jobs", +id, inputBody);

    if (!error) {
      toast({
        title: "Submission success",
        description: response,
        variant: "default",
      });
      setIsSuccess(true);
    }
  };

  const handleQtyChange = (orderItemId: number, newQty: number) => {
    setInputBody((prev) => prev.map((item) => (item.orderItemId === orderItemId ? { ...item, qty: newQty } : item)));
  };

  const handleValid = () => {
    const valid = validateOrderItemInputs({ inputBody, inputRef, setErrors, orderItemNames });
    setIsValid(valid);
  };

  const handleFormSuccess = () => {
    setFormOpen(false)
    setTimeout(() => router.refresh(), 1000)
  }

  useEffect(() => {
    handleValid();
  }, [inputBody]);

  useEffect(() => {
    fetchEmployeeStatus();
  }, []);

  useEffect(() => {
    fetchJob();
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  const canTakeLaundryJob = !!(!loading && !error && isValid);
  const isTakeLaundryJob = !!(
    role === "worker" &&
    inputRef &&
    employeeStatus.isPresent &&
    !job?.isCompleted &&
    (job?.orderStatus === "READY_FOR_WASHING" || job?.orderStatus === "WASHING_COMPLETED" || job?.orderStatus === "IRONING_COMPLETED")
  );
  const isPending = !!(isTakeLaundryJob && job.isByPassRequested && !job.byPassStatus);
  const isPendingProcess = !!(isPending || job?.byPassStatus === "REJECTED");
  const canProcessJob = !!(!job?.isCompleted && employeeStatus.isPresent);

  return (
    <div className="mx-auto space-y-6 max-w-screen-lg">
      <div className="sm:p-5 sm:bg-white sm:shadow sm:rounded-xl w-full items-center">
        {loading ? (
          <div className="flex flex-col gap-3 mt-4 sm:mt-0 w-full max-w-screen-sm">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-48 mt-8" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-6 w-48 mt-8" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </div>
        ) : error ? (
          <ErrorTable errorMessage={error} />
        ) : (
          job && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center mt-4 sm:mt-0">
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {role === "driver" ? "Transport " : "Laundry "} Job #{id}
                  </h1>
                  {isTakeLaundryJob ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setFormOpen(true)}
                        disabled={isValid || loading || !!error || isPending}
                        variant="outline"
                        size="lg"
                        className="hidden sm:block"
                      >
                        Bypass request
                      </Button>
                      <Button
                        disabled={!canTakeLaundryJob || isPending || job.byPassStatus === "REJECTED"}
                        variant="birtu"
                        size="lg"
                        className="hidden sm:block"
                        onClick={() => setAlertOpen(true)}
                      >
                        {job.isByPassRequested ? "Process Job" : "Take Job"}
                      </Button>
                    </div>
                  ) : (
                    canProcessJob && (
                      <Button disabled={!!error || loading} variant="birtu" size="lg" className="hidden sm:block" onClick={() => setAlertOpen(true)}>
                        {job.employeeName ? "Process Job" : "Take Job"}
                      </Button>
                    )
                  )}
                </div>
                <Separator />
                {isPending && (
                  <div className="flex gap-3 items-center font-medium text-amber-700">
                    <AlertCircle className="size-10 sm:size-5" />
                    <p className="italic text-sm sm:text-base">
                      Pending bypass request. While waiting for admin confirmation, you cannot request another bypass or process the job.
                    </p>
                  </div>
                )}
                {job.byPassStatus === "REJECTED" && (
                  <div className="flex gap-3 items-center font-medium text-rose-700">
                    <AlertCircle className="size-10 sm:size-5" />
                    <p className="italic text-sm sm:text-base">
                      Your last bypass request was rejected by admin. Request another bypass to process your job.
                    </p>
                  </div>
                )}
                <JobDetailsCard
                  role={role}
                  job={job}
                  isTakeLaundryJob={isTakeLaundryJob}
                  isValid={isValid}
                  isPending={isPendingProcess}
                  inputBody={inputBody}
                  errors={errors}
                  handleQtyChange={handleQtyChange}
                />
              </div>
              <div className={`${isTakeLaundryJob ? "block mt-4" : "fixed"}  w-[calc(100vw-32px)] bottom-5`}>
                {isTakeLaundryJob ? (
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => setFormOpen(true)}
                      disabled={isValid || loading || !!error || isPending}
                      variant="outline"
                      size="lg"
                      className="block sm:hidden h-12"
                    >
                      Bypass request
                    </Button>
                    <Button
                      disabled={!canTakeLaundryJob || isPending || job.byPassStatus === "REJECTED"}
                      variant="birtu"
                      size="lg"
                      className="block sm:hidden w-full h-12"
                      onClick={() => setAlertOpen(true)}
                    >
                      {job.isByPassRequested ? "Process Job" : "Take Job"}
                    </Button>
                  </div>
                ) : (
                  canProcessJob && (
                    <Button
                      disabled={!!error || loading}
                      variant="birtu"
                      size="lg"
                      className="block sm:hidden w-full h-12"
                      onClick={() => setAlertOpen(true)}
                    >
                      {job.employeeName ? "Process Job" : "Take Job"}
                    </Button>
                  )
                )}
              </div>
              <ProcessModal loading={loading} onClose={() => setAlertOpen(false)} onSubmit={() => updateJob()} open={isAlertOpen} />
              <Dialog open={isFormOpen} onOpenChange={() => setFormOpen(false)}>
                <DialogContent>
                  <BypassRequestForm
                    laundryJobId={+id}
                    orderId={job.orderId}
                    station={job.station as WorkerStation}
                    onRequestSuccess={handleFormSuccess}
                  />
                </DialogContent>
              </Dialog>
            </>
          )
        )}
      </div>
    </div>
  );
}
