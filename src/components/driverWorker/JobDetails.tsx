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

export default function JobDetails({ role, id }: { role: "driver" | "worker"; id: string }) {
  const { getJobById, updateJob: alterJob, loading: apiLoading, error } = useDriverWorker();
  const [job, setJob] = useState<GetJobByIdResponse>();

  const [inputBody, setInputBody] = useState<UpdateLaundryJobInputBody[]>([]);
  const [inputRef, setInputRef] = useState<UpdateLaundryJobInputBody[]>([]);
  const [orderItemNames, setOrderItemNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const [isAlertOpen, setAlertOpen] = useState<boolean>(false);

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
          qty: 0,
        }));
        setOrderItemNames(itemNames);
        setInputRef(orderItems);
        setInputBody(defaultItems);
      }
    }
    setJob(response);
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

  useEffect(() => {
    handleValid();
  }, [inputBody]);

  useEffect(() => {
    fetchJob();
  }, []);

  useEffect(() => {
    fetchJob();
  }, [isSuccess == true]);

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
    !job?.isCompleted &&
    (job?.orderStatus === "READY_FOR_WASHING" || job?.orderStatus === "WASHING_COMPLETED" || job?.orderStatus === "IRONING_COMPLETED")
  );

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
                      <Button disabled={isValid || loading || !!error} variant="outline" size="lg" className="hidden sm:block">
                        Bypass request
                      </Button>
                      <Button disabled={!canTakeLaundryJob} variant="birtu" size="lg" className="hidden sm:block" onClick={() => setAlertOpen(true)}>
                        Take Job
                      </Button>
                    </div>
                  ) : (
                    !job.isCompleted && (
                      <Button disabled={!!error || loading} variant="birtu" size="lg" className="hidden sm:block" onClick={() => setAlertOpen(true)}>
                        {job.employeeName ? "Process Job" : "Take Job"}
                      </Button>
                    )
                  )}
                </div>
                <Separator />
                <JobDetailsCard
                  role={role}
                  job={job}
                  isTakeLaundryJob={isTakeLaundryJob}
                  isValid={isValid}
                  inputBody={inputBody}
                  errors={errors}
                  handleQtyChange={handleQtyChange}
                />
              </div>
              <div className="fixed w-[calc(100vw-32px)] bottom-5">
                {isTakeLaundryJob ? (
                  <div className="flex flex-col gap-3">
                    <Button disabled={isValid || loading || !!error} variant="outline" size="lg" className="block sm:hidden h-12">
                      Bypass request
                    </Button>
                    <Button
                      disabled={!canTakeLaundryJob}
                      variant="birtu"
                      size="lg"
                      className="block sm:hidden w-full h-12"
                      onClick={() => setAlertOpen(true)}
                    >
                      Take Job
                    </Button>
                  </div>
                ) : (
                  !job.isCompleted && (
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
            </>
          )
        )}
      </div>
    </div>
  );
}
