"use client";

import { NotificationRecord } from "@/types/notification";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function NotificationCard({ item, time }: { item: NotificationRecord; time: { time: string; isDate: boolean } }) {
  return (
    <CardHeader className="px-5 py-3">
      <CardTitle>{item.title}</CardTitle>
      <Separator />
      <CardDescription>{item.description}</CardDescription>
      <CardDescription>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className={`${!time.isDate ? "hover:underline text-birtu brightness-50 hover:brightness-75 transition" : ""}`}>
              {time.time}
            </TooltipTrigger>
            {!time.isDate ? (
              <>
                <TooltipContent side="right" className="bg-birmud pointer-events-auto shadow text-black">
                  {new Date(item.createdAt).toLocaleString()}
                </TooltipContent>
              </>
            ) : (
              <></>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardDescription>
    </CardHeader>
  );
}
