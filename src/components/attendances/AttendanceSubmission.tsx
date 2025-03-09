"use client";

import { Button } from "../ui/button";
import { ClipboardCheck, ClipboardX, LoaderCircle } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface AttendanceSubmissionProps {
  loading: boolean;
  error: string | null;
  conditions: {
    isOffShift: boolean;
    isClockedOut: boolean;
    canSubmit: boolean;
    isWaiting: boolean;
    isIdling: boolean;
    isBusy: boolean;
    isPresent: boolean;
    isWorking: boolean;
    canClockIn: boolean;
  };
  hours: {
    nextShift: string;
    shiftStart: string;
    shiftEnd: string;
  };
  isAlertOpen: boolean;
  onSubmit: () => void;
  onOpenModal: (value: "CLOCK_IN" | "CLOCK_OUT") => void;
  onCloseModal: () => void;
}

export default function AttendanceSubmission({
  loading,
  error,
  conditions,
  hours,
  isAlertOpen,
  onSubmit: handleSubmit,
  onOpenModal: handleOpenModal,
  onCloseModal: handleCloseModal,
}: AttendanceSubmissionProps) {
  return (
    <div className="mx-auto p-3 space-y-6 max-w-screen-sm text-center">
      <div className="sm:p-6 flex flex-col space-y-4 sm:bg-white sm:shadow sm:rounded-xl w-full items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Attendance Submission</h1>
        {loading ? (
          <>
            <Skeleton className="h-5 w-full mt-2" />
            <Skeleton className="h-5 w-full mt-2" />
          </>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <p className="text-muted-foreground">
            {conditions.isOffShift
              ? `You're out of your shift hours. See you on your next shift window at ${hours.nextShift}:00.`
              : conditions.isClockedOut
              ? `You have clocked out on your shift today. See you on your next shift window at ${hours.nextShift}:00.`
              : conditions.canSubmit
              ? "You are currently on your clock in window. Clock in your attendance now!"
              : conditions.isWaiting
              ? `You have clocked in early. Your work shift starts at ${hours.shiftStart}:00.`
              : conditions.isIdling
              ? `You are now on your workshift. Your shift ends at ${hours.shiftEnd}:00.`
              : conditions.isBusy
              ? "You are now on an ongoing job. Finish your job to enable clock out submission."
              : `You are currently exceeding off your work shift at ${hours.shiftEnd}:00. You can clock in your next shift at ${hours.nextShift}:00.`}
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
        ) : conditions.isPresent ? (
          <Button
            size="lg"
            onClick={() => handleOpenModal("CLOCK_OUT")}
            disabled={conditions.isWorking}
            variant="outline"
            className="border-0 font-semibold text-white bg-rose-500 hover:bg-rose-400 saturate-[.65] hover:text-white active:scale-95 disabled:cursor-not-allowed w-64"
          >
            <ClipboardX /> Clock-out
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => handleOpenModal("CLOCK_IN")}
            disabled={!conditions.canClockIn}
            variant="outline"
            className="border-0 font-semibold text-white bg-lime-500 hover:bg-lime-400 saturate-[.65] hover:text-white active:scale-95 disabled:cursor-not-allowed w-64"
          >
            <ClipboardCheck /> Clock-in
          </Button>
        )}
      </div>
      <Dialog onOpenChange={handleCloseModal} open={isAlertOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Attendance</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit attendance? Once you submitted you cannot clock in/clock out again in your current shift.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button onClick={handleCloseModal} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} variant="birtu">
              {loading ? "Loading" : "Submit Attendance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
