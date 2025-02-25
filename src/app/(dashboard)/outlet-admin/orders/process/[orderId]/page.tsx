// src/app/(dashboard)/(routes)/outlet-admin/orders/process/[orderId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { usePendingOrders } from "@/hooks/api/orders/usePendingOrders";
import { ProcessOrderForm } from "@/components/orders/process-order/ProcessOrderForm";

export default function ProcessSpecificOrderPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const orderId = parseInt(params.orderId, 10);
  const [isLoading, setIsLoading] = useState(true);
  const [orderExists, setOrderExists] = useState(false);
  const { getPendingOrders } = usePendingOrders();

  useEffect(() => {
    const checkOrder = async () => {
      try {
        setIsLoading(true);
        const pendingOrders = await getPendingOrders();

        // Periksa apakah pendingOrders adalah array
        if (Array.isArray(pendingOrders)) {
          const exists = pendingOrders.some((order) => order.id === orderId);
          setOrderExists(exists);
        } else {
          console.error("Expected array but got:", pendingOrders);
          setOrderExists(false);
        }
      } catch (error) {
        console.error("Failed to check order", error);
        setOrderExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOrder();
  }, [orderId, getPendingOrders]);

  const handleSuccess = () => {
    router.push("/super-admin/orders/process");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderExists) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col items-center justify-center h-64 text-center">
          <h3 className="text-xl font-medium">Order not found</h3>
          <p className="text-muted-foreground mt-2">
            The order you're looking for doesn't exist or has already been
            processed.
          </p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => router.push("/super-admin/orders/process")}
          >
            View All Pending Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Process Order #{orderId}
        </h2>
        <p className="text-muted-foreground">
          Add laundry weight and items to process this order
        </p>
      </div>

      <div className="flex justify-center w-full">
        <ProcessOrderForm orderId={orderId} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
