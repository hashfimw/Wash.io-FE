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

export function PendingOrdersList() {
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
    router.push(`/super-admin/orders/process/${orderId}`);
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
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-xl font-medium text-destructive">
              Error loading orders
            </h3>
            <p className="text-muted-foreground mt-2">{error}</p>
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
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">No pending orders</h3>
            <p className="text-muted-foreground mt-2">
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pending Orders</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center">
                  <h4 className="font-medium">Order #{order.id}</h4>
                  <Badge variant="outline" className="ml-2">
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
                variant="default"
                size="sm"
                onClick={() => handleProcess(order.id)}
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
