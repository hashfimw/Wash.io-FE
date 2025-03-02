"use client";

import { getTimeDifferenceString } from "@/utils/dateTime";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function TmeDifferenceTooltip({ date }: { date: string }) {
  const timeDiff = getTimeDifferenceString(date);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={`${!timeDiff.isDate ? "hover:underline text-birtu brightness-50 hover:brightness-75 transition" : ""}`}>
          {timeDiff.time}
        </TooltipTrigger>
        {!timeDiff.isDate ? (
          <>
            <TooltipContent side="right" className="bg-birmud pointer-events-auto shadow text-black">
              {new Date(date).toLocaleString()}
            </TooltipContent>
          </>
        ) : (
          <></>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
