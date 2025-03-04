"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePendingOrders } from "@/hooks/api/orders/usePendingOrders";
import { ProcessOrderForm } from "@/components/orders/process-order/ProcessOrderForm";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

export default function ProcessSpecificOrderPage() {
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;
  const orderId = parseInt(params.orderId as string, 10);

  const [isLoading, setIsLoading] = useState(true);
  const [orderExists, setOrderExists] = useState(false);
  const { getPendingOrders } = usePendingOrders();
  const { setBreadcrumbItems } = useBreadcrumb();

  // Set breadcrumb based on role
  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Orders", href: `/dashboard/${role}/orders` },
      { label: "Process Orders", href: `/dashboard/${role}/orders/process` },
      { label: `Order #${orderId}` },
    ]);
  }, [setBreadcrumbItems, role, orderId]);

  useEffect(() => {
    const checkOrder = async () => {
      try {
        setIsLoading(true);
        const pendingOrders = await getPendingOrders();

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
    router.push(`/dashboard/${role}/orders/process`);
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
            onClick={() => router.push(`dashboard/${role}/orders/process`)}
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
        <ProcessOrderForm
          orderId={orderId}
          onSuccess={handleSuccess}
          role={role}
        />
      </div>
    </div>
  );
}
