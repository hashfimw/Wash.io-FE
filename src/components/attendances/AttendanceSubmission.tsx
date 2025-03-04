"use client";

import { useAttendance } from "@/hooks/api/attendances/useAttendance";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ClipboardCheck, ClipboardX, LoaderCircle } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { addDays, addHours, format } from "date-fns";
import SubmissionModal from "./SubmissionModal";

export default function AttendanceSubmission() {
  const [isOnWorkShift, setIsOnWorkShift] = useState<boolean>(false);
  const [isPresent, setIsPresent] = useState<boolean>(false);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [canClockIn, setCanClockIn] = useState<boolean>(false);
  const [isAttended, setIsAttended] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [shiftStart, setShiftStart] = useState<string>("");

  const [isAlertOpen, setAlertOpen] = useState<boolean>(false);
  const [submitValue, setSubmitValue] = useState<"CLOCK_IN" | "CLOCK_OUT">();

  const { getEmployeeStatus, createAttendance, loading: apiLoading, error } = useAttendance();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const loading = !!(pageLoading || apiLoading);
  const { toast } = useToast();

  const fetchEmployeeStatus = async () => {
    setPageLoading(true);
    const response = await getEmployeeStatus();

    setIsOnWorkShift(response.isOnWorkShift);
    setIsWorking(response.isWorking);
    setIsPresent(response.isPresent);
    setCanClockIn(response.canClockIn);
    setIsAttended(response.isAttended);
    setShiftStart(response.shiftStart);
    setPageLoading(false);
  };

  useEffect(() => {
    fetchEmployeeStatus();
  }, []);

  useEffect(() => {
    fetchEmployeeStatus();
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

  const submitAttendance = async (attendanceType: "CLOCK_IN" | "CLOCK_OUT") => {
    setAlertOpen(false);
    setPageLoading(true);
    setIsSuccess(false);
    const response = createAttendance(attendanceType);

    if (!error) {
      toast({
        title: "Submission success",
        description: response,
        variant: "default",
      });
      setIsSuccess(true);
    }
  };

  const handleSubmit = () => {
    if (submitValue) {
      submitAttendance(submitValue);
    }
  };

  const handleCloseModal = () => {
    setAlertOpen(false);
  };

  const handleOpenModal = (value: "CLOCK_IN" | "CLOCK_OUT") => {
    setSubmitValue(value);
    setAlertOpen(true);
  };

  const handleShiftStart = () => {
    return addHours(shiftStart, 1);
  };

  const handleShiftEnd = () => {
    return addHours(shiftStart, 9);
  };

  const handleNextShift = () => {
    return addDays(shiftStart, 1);
  };

  const isClockedOut = !!(!canClockIn && !isPresent && isAttended);
  const isOffShift = !!(!canClockIn && !isPresent && !isAttended);
  const canSubmit = !!(canClockIn && !isPresent);
  const isWaiting = !!(isPresent && !isOnWorkShift && new Date() < handleShiftStart());
  const isIdling = !!(isPresent && !isWorking && new Date() < handleShiftEnd());
  const isBusy = !!(isPresent && isWorking);

  return (
    <div className="mx-auto p-3 space-y-6 max-w-screen-sm text-center">
      <div className="sm:p-6 flex flex-col space-y-4 sm:bg-white sm:shadow sm:rounded-xl w-full items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Attendance Submission</h1>
        {loading ? (
          <>
            <Skeleton className="h-5 w-full mt-2" />
            <Skeleton className="h-5 w-full mt-2" />
          </>
        ) : (
          <p className="text-muted-foreground">
            {isOffShift
              ? `You're out of your shift hours. See you on your next shift at ${format(handleNextShift(), "HH")}:00.`
              : isClockedOut
              ? `You have clocked out on your shift today. See you on your next shift at ${format(handleNextShift(), "HH")}:00.`
              : canSubmit
              ? "You are currently on your clock in window. Clock in your attendance now!"
              : isWaiting
              ? `You have clocked in early. Your work shift starts at ${format(handleShiftStart(), "HH")}:00.`
              : isIdling
              ? `You are now on your workshift. Your shift ends at ${format(handleShiftEnd(), "HH")}:00.`
              : isBusy
              ? "You are now on an ongoing job. Finish your job to enable clock out submission."
              : `You are currently exceeding off your work shift at ${format(handleShiftEnd(), "HH")}:00. You are free to clock out your attendance!`}
          </p>
        )}
        {loading ? (
          <Button
            size="lg"
            disabled
            variant="outline"
            className="border-0 font-semibold text-white bg-[#BD863B] saturate-[.75] hover:text-white active:scale-95 disabled:cursor-not-allowed w-64"
          >
            <LoaderCircle className="animate-spin" /> Loading
          </Button>
        ) : isPresent ? (
          <Button
            size="lg"
            onClick={() => handleOpenModal("CLOCK_OUT")}
            disabled={isWorking}
            variant="outline"
            className="border-0 font-semibold text-white bg-rose-500 hover:bg-rose-400 saturate-[.65] hover:text-white active:scale-95 disabled:cursor-not-allowed w-64"
          >
            <ClipboardX /> Clock-out
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => handleOpenModal("CLOCK_IN")}
            disabled={!canClockIn}
            variant="outline"
            className="border-0 font-semibold text-white bg-lime-500 hover:bg-lime-400 saturate-[.65] hover:text-white active:scale-95 disabled:cursor-not-allowed w-64"
          >
            <ClipboardCheck /> Clock-in
          </Button>
        )}
        <SubmissionModal open={isAlertOpen} onClose={handleCloseModal} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
