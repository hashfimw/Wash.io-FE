"use client";

import { NotificationRecord } from "@/types/notification";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import TimeDifferenceTooltip from "../notification/TimeDifferenceTooltip";

export function NotificationCardContent({ item }: { item: NotificationRecord }) {
  return (
    <CardHeader className="px-5 py-3">
      <CardTitle>{item.title}</CardTitle>
      <Separator />
      <CardDescription>{item.description}</CardDescription>
      <CardDescription>
        <TimeDifferenceTooltip date={item.createdAt} />
      </CardDescription>
    </CardHeader>
  );
}

export function NotificationCard({ children, item, onClick }: { children: React.ReactNode; item: NotificationRecord; onClick?: () => void }) {
  return (
    <Card
      onClick={onClick}
      className={`relative z-0 ${!item.isRead ? " bg-orange-50 hover:bg-orange-100" : "bg-putbir brightness-95 hover:brightness-100"} transition`}
    >
      <div
        className={`${!item.isRead ? "absolute -left-1 -top-1 size-4 bg-oren rounded-full blur-[1px] animate-ping duration-1500" : "hidden"}`}
      ></div>
      {children}
    </Card>
  );
}
