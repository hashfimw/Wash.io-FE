"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/hooks/api/notifications/useNotification";
import { NotificationRecord, NotificationRequestType } from "@/types/notification";
import { useEffect, useState } from "react";
import { Card, CardHeader } from "../ui/card";
import { NotificationPagination } from "./NotificationPagination";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { useToast } from "../ui/use-toast";
import Image from "next/image";
import { NotificationCard, NotificationCardContent } from "./NotificationCard";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationModal({ open, onClose }: NotificationModalProps) {
  const [page, setPage] = useState<number>(1);
  const [requestType, setRequestType] = useState<NotificationRequestType>("unread");

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalPages, setTotalPage] = useState<number>(1);
  const [totalData, setTotalData] = useState<number>(0);

  const { loading: apiLoading, error, getNotifications, getUnreadCount, markAllAsRead, markAsReadById } = useNotification();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const loading = !!(pageLoading || apiLoading);
  const { toast } = useToast();

  const fetchNotification = async () => {
    setPageLoading(true);
    const response = await getNotifications({ page, limit: 5, requestType });

    setNotifications(response.data);
    setPage(response.meta.page);
    setTotalPage(response.meta.total_pages);
    setTotalData(response.meta.total_data);
    setPageLoading(false);
  };

  const fetchUnreadCount = async () => {
    const response = await getUnreadCount();
    setUnreadCount(response.data);
  };

  const alterAsReadById = async (id: number, isRead: boolean) => {
    setPageLoading(true);
    if (!isRead) {
      onClose();
      await markAsReadById(id);
    }
    setPageLoading(false);
  };

  const alterAllAsRead = async () => {
    const response = await markAllAsRead();
    if (response) {
      toast({
        title: "Alert",
        description: `${unreadCount} notification(s) are marked as read!`,
        variant: "default",
      });
      setPage(1);
      fetchNotification();
      fetchUnreadCount();
    }
  };

  const handleRequestType = (value: NotificationRequestType) => {
    setRequestType(value);
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleClose = () => {
    onClose();
    setPage(1);
    setRequestType("unread");
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    fetchNotification();
  }, [page, requestType]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  if (error) {
    return;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] overflow-y-auto max-h-[90vh] bg-putbir px-2 sm:px-6 rounded-xl">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            {loading ? (
              <>
                <div className="flex place-content-center items-center sm:place-content-start">
                  <Skeleton className="h-5 w-60" />
                </div>
              </>
            ) : (
              <>
                <span>You have </span>
                <span className="font-bold">{unreadCount}</span>
                <span> unread notification(s)</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="bg-birmud/75 rounded-xl shadow-inner p-2 space-y-3">
          <div className="w-full flex text-center text-sm space-x-2">
            {["Unread", "Read"].map((value) => {
              const state = value.toLowerCase();
              return (
                <button
                  onClick={() => handleRequestType(state as NotificationRequestType)}
                  disabled={requestType == state || loading}
                  className={`${requestType == state ? "bg-birtu text-white shadow-md" : "text-birtu hover:bg-birtu/10 hover:shadow-inner"} ${
                    loading && "hover:cursor-not-allowed"
                  } w-1/2 p-2 rounded-md font-semibold transition`}
                >
                  {value}
                </button>
              );
            })}
          </div>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <Card key={idx}>
                <CardHeader className="p-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                </CardHeader>
              </Card>
            ))
          ) : notifications.length > 0 ? (
            <>
              {notifications.map((item, idx) => {
                return item.url ? (
                  <NotificationCard key={idx} item={item} onClick={() => alterAsReadById(item.id, item.isRead)}>
                    <Link href={item.url}>
                      <NotificationCardContent item={item} />
                    </Link>
                  </NotificationCard>
                ) : (
                  <NotificationCard key={idx} item={item}>
                    <NotificationCardContent item={item} />
                  </NotificationCard>
                );
              })}
              <div className="flex flex-col space-y-3">
                <p className="text-sm font-medium text-center text-muted-foreground">
                  Showing {notifications.length} out of {totalData} notification(s)
                </p>
                <div className="flex justify-between">
                  <div>{totalPages > 1 && <NotificationPagination onPageChange={handlePageChange} currentPage={page} totalPages={totalPages} />}</div>
                  <Button onClick={() => alterAllAsRead()} disabled={requestType == "read"} className={`bg-birtu hover:bg-oren transition w-fit`}>
                    Mark all as read
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex space-y-3 flex-col items-center place-content-center py-6">
              <Image
                className="w-64 opacity-50 pointer-events-none"
                priority
                width={1000}
                height={1000}
                src={"https://res.cloudinary.com/dowc5iu9c/image/upload/v1740797535/uw9ticbr55vrwafviv60.png"}
                alt="no notifications"
              />
              <p className="text-muted-foreground font-medium text-center">Nothing to see here...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
