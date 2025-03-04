// src/components/orders/PendingOrdersList.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ArrowRight, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePendingOrders } from "@/hooks/api/orders/usePendingOrders";
import { Order } from "@/types/order";

interface PendingOrdersListProps {
  role: string;
}

export function PendingOrdersList({ role }: PendingOrdersListProps) {
  const router = useRouter();
  const { loading, error, getPendingOrders } = usePendingOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const pendingOrders = await getPendingOrders();
      setOrders(pendingOrders as Order[]);
    } catch (error) {
      console.error("Failed to fetch pending orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProcess = (orderId: number) => {
    router.push(`/dashboard/${role}/orders/process/${orderId}`);
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-lg sm:text-xl font-medium text-destructive">
              Error loading orders
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {error}
            </p>
            <Button variant="outline" className="mt-4" onClick={fetchOrders}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ClipboardList className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-medium">
              No pending orders
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              All orders have been processed. Check back later for new orders.
            </p>
            <Button variant="outline" className="mt-4" onClick={fetchOrders}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <CardTitle className="text-xl">Pending Orders</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-4"
            >
              <div className="space-y-1 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <h4 className="font-medium">Order #{order.id}</h4>
                  <Badge
                    variant="outline"
                    className="mt-1 sm:mt-0 sm:ml-2 w-fit"
                  >
                    Arrived at Outlet
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.customerAddress.addressLine}
                </p>
                <p className="text-xs text-muted-foreground">
                  Received: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="oren"
                size="sm"
                onClick={() => handleProcess(order.id)}
                className="w-full sm:w-auto"
              >
                Process <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
