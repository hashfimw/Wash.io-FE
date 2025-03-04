"use client";

import { useDriverWorker } from "@/hooks/api/driver-worker/useDriverWorker";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { GetJobByIdResponse, UpdateLaundryJobInputBody } from "@/types/driverWorker";
import { Button } from "../ui/button";
import ProcessModal from "./ProcessModal";
import { Input } from "../ui/input";
import validateOrderItemInputs from "./validateTakeLaundryJobSchema";

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
    <div className="mx-auto p-3 space-y-6 max-w-screen-lg">
      <div className="sm:p-6 space-y-4 sm:bg-white sm:shadow sm:rounded-xl w-full items-center">
        {loading ? (
          <>Loading</>
        ) : error ? (
          <>Error: error</>
        ) : (
          job && (
            <>
              <div className="flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {role === "driver" ? "Transport " : "Laundry "} Job #{id}
                </h1>
                {isTakeLaundryJob ? (
                  <div className="flex gap-3">
                    <Button disabled={isValid} variant="outline" size="lg" className="hidden sm:block" onClick={() => setAlertOpen(true)}>
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
              <div className="flex flex-col gap-4">
                <p>{role === "driver" ? <p>Transport type: {job.transportType}</p> : <p>Station: {job.station}</p>}</p>
                {job.employeeId && <p>{job.isCompleted ? "Completed" : "In Progress"}</p>}
                <p>Issue date: {job.createdAt}</p>
                <p>Last updated date: {job.updatedAt}</p>
                <p>Status: {job.orderStatus}</p>
                {job.employeeName && <p>Handler: {job.employeeName}</p>}
                {role === "driver" ? (
                  <>
                    <p>Customer: {job.customerName}</p>
                    <p>Distance: {job.distance} km</p>
                    {job.address && (
                      <p>
                        Address line: {job.address.addressLine}, {job.address.province}, {job.address.regency}, {job.address.district},{" "}
                        {job.address.village}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p>Customer: {job.customerName}</p>
                    <p>Weight: {job.laundryWeight} kg</p>
                    {inputBody.map((item, idx) => (
                      <div className="flex gap-3" key={item.orderItemId}>
                        <p>
                          {"#"}
                          {idx + 1} {job.orderItem![idx].qty} x {job.orderItem![idx].orderItemName}
                        </p>
                        {isTakeLaundryJob && (
                          <Input
                            type="number"
                            min="0"
                            value={item.qty}
                            onChange={(e) => handleQtyChange(item.orderItemId, parseInt(e.target.value) || 0)}
                            required
                          />
                        )}
                      </div>
                    ))}
                    {isTakeLaundryJob ? (
                      <>
                        {errors.length > 0 && (
                          <div className="my-4 p-3 bg-red-100 text-red-700 rounded">
                            <p className="font-bold">Validation Errors:</p>
                            <ul className="list-disc ml-5">
                              {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {isValid && <div className="my-4 p-3 bg-green-100 text-green-700 rounded">All items match the expected values!</div>}
                      </>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </div>
              {isTakeLaundryJob ? (
                <Button disabled={!canTakeLaundryJob} variant="birtu" size="lg" className="block sm:hidden w-full" onClick={() => setAlertOpen(true)}>
                  Take Job
                </Button>
              ) : (
                !job.isCompleted && (
                  <Button
                    disabled={!!error || loading}
                    variant="birtu"
                    size="lg"
                    className="block sm:hidden w-full"
                    onClick={() => setAlertOpen(true)}
                  >
                    {job.employeeName ? "Process Job" : "Take Job"}
                  </Button>
                )
              )}
              <ProcessModal loading={loading} onClose={() => setAlertOpen(false)} onSubmit={() => updateJob()} open={isAlertOpen} />
            </>
          )
        )}
      </div>
    </div>
  );
}
