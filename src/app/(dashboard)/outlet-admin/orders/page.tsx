// src/app/(dashboard)/outlet-admin/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { OrderTable } from "@/components/orders/OrderTable";
import { useOrders } from "@/hooks/api/orders/useOrders";
import { Order } from "@/types/order";
import { useBreadcrumb } from "@/context/BreadcrumbContext";

export default function OutletAdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { getOutletOrders, loading, error } = useOrders();
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOutletOrders();
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    setBreadcrumbItems([
      { label: "Outlet Admin", href: "/outlet-admin/dashboard" },
      { label: "Orders" },
    ]);
  }, [setBreadcrumbItems]);

  const handleTrackOrder = (orderId: number) => {
    // Implementasi tracking
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Outlet Orders
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
          <OrderTable
            orders={orders}
            loading={loading}
            error={error}
            isAdmin={false}
            onTrackOrder={handleTrackOrder}
          />
        </div>
      </div>
    </div>
  );
}
