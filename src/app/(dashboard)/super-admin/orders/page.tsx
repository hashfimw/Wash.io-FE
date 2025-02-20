// src/app/(dashboard)/super-admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { OrderTable } from "@/components/orders/OrderTable";
import { useOrders } from "@/hooks/api/orders/useOrders";
import { useOutlets } from "@/hooks/api/outlets/useOutlets";
import { Order, OrderTrackingResponse } from "@/types/order";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { OrderTrackingDialog } from "@/components/orders/order-tracking/OrderTrackigDialog";

export default function SuperAdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number | undefined>(
    undefined
  );
  const [trackingData, setTrackingData] =
    useState<OrderTrackingResponse | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const { getAllOrders, trackOrder, loading, error } = useOrders();
  const { outlets, getOutlets } = useOutlets();
  const { setBreadcrumbItems } = useBreadcrumb();

  // Fetch outlets when component mounts
  useEffect(() => {
    getOutlets();
  }, []);

  // Fetch orders when selectedOutletId changes

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrders(selectedOutletId);
        setOrders(response.data.data);
        console.log("response Data", response);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [selectedOutletId]);

  console.log("Orders Data", orders);

  useEffect(() => {
    setBreadcrumbItems([
      { label: "Super Admin", href: "/super-admin/dashboard" },
      { label: "Orders" },
    ]);
  }, [setBreadcrumbItems]);

  const handleOutletChange = (outletId: number | undefined) => {
    setSelectedOutletId(outletId);
  };

  const handleTrackOrder = async (orderId: number) => {
    try {
      const response = await trackOrder(orderId);
      setTrackingData(response.data.data);
      setIsTrackingOpen(true);
    } catch (error) {
      console.error("Error tracking order:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            All Orders and Tracking Orders
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
          <OrderTable
            orders={orders}
            loading={loading}
            error={error}
            isAdmin={true}
            outlets={outlets}
            onOutletChange={handleOutletChange}
            onTrackOrder={handleTrackOrder}
          />
        </div>
      </div>

      <OrderTrackingDialog
        open={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingData(null);
        }}
        tracking={trackingData}
        loading={loading}
      />
    </div>
  );
}
