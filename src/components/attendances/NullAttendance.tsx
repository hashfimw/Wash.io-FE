"use client";

import { CircleHelp, ClipboardCheck, ClipboardList, ClipboardX } from "lucide-react";
import Cloud from "../driverWorker/Cloud";

export default function NullAttendance() {
  return (
    <div className="size-full flex flex-col items-center place-content-center py-12 max-w-[480px] mx-auto gap-2">
      <div className="relative size-36 opacity-50 mb-2">
        <Cloud className="absolute left-2 -top-4 size-40 scale-x-[-1] fill-birtu/50" />
        <Cloud className="absolute -left-6 size-44 rotate-[168deg] fill-birmud" />
        <ClipboardList className="absolute size-32 left-1 -top-5" />
        <ClipboardCheck className="absolute size-24 -rotate-[30deg] text-lime-800 -left-14 bottom-9" />
        <ClipboardX className="absolute size-24 rotate-[20deg] text-rose-800 bottom-2 left-24" />
        <CircleHelp className="absolute -bottom-4 left-[27px] size-20 text-red-700 stroke-[3] animate-bounce" />{" "}
      </div>
      <p className="text-xl font-semibold text-black/75">No records found</p>
      <p className="text-muted-foreground font-medium text-center">
        You have not submitted any attendances yet. It seems that you are new here, aren't you?
      </p>
    </div>
  );
}
