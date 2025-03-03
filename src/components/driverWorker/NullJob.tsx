"use client";

import { Bike, CircleHelp, WashingMachine } from "lucide-react";
import Cloud from "./Cloud";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function NullJob({ requestType, endPoint }: { requestType: "history" | "request"; endPoint: "transport-jobs" | "laundry-jobs" }) {
  const router = useRouter();
  return (
    <div className="size-full flex flex-col items-center place-content-center py-12 max-w-[480px] mx-auto gap-3">
      <div className="relative size-36 opacity-50 mb-2">
        <Cloud className="absolute -top-6 size-44 scale-x-[-1] fill-birtu/50" />
        <Cloud className="absolute -top-2 -left-8 size-48 rotate-[168deg] fill-birmud" />{" "}
        <Bike className="absolute size-32 -left-10 text-oren brightness-50 -rotate-[30deg]" />
        <WashingMachine className="absolute size-32 bottom-0 -right-8 text-birtu brightness-50 rotate-12" />
        <CircleHelp className="absolute -bottom-4 left-[27px] size-20 text-red-700 stroke-[3] animate-bounce" />
      </div>
      <p className="text-xl font-semibold text-black/75">{requestType === "history" ? "No jobs found" : "No jobs available"}</p>
      <p className="text-muted-foreground font-medium text-center mb-2">
        {requestType === "history"
          ? "You have not handled any job in the past. Check your Job Requests page to assign to your first job now!"
          : "No jobs available for you at your outlet right now!"}
      </p>
      {requestType === "history" && (
        <Button
          onClick={() => router.push(`/employee-dashboard/${endPoint === "transport-jobs" ? "driver" : "worker"}/requests`)}
          variant="outline"
          className="bg-birtu text-white hover:text-white transition hover:bg-oren rounded-lg border-0"
        >
          Go to Job Requests
        </Button>
      )}
    </div>
  );
}
