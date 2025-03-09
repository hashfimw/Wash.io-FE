"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { format, formatDistanceToNow } from "date-fns";

export default function TmeDifferenceTooltip({ date }: { date: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={`hover:underline text-birtu brightness-50 hover:brightness-75 transition`}>
          {formatDistanceToNow(date, { includeSeconds: true, addSuffix: true })}
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-muted pointer-events-auto shadow text-black">
          {format(new Date(date), "PPPp")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
