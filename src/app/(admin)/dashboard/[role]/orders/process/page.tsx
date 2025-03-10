"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { PendingOrdersList } from "@/components/orders/process-order/PendingOrderlist";

export default function ProcessOrdersPage() {
  const params = useParams();
  const role = params.role as string;
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([
      { label: roleName, href: `/dashboard/${role}` },
      { label: "Orders", href: `/dashboard/${role}/orders` },
      { label: "Process Orders" },
    ]);
  }, [setBreadcrumbItems, role]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Process Orders</h2>
        <p className="text-muted-foreground">Process customer orders by adding laundry weight and items</p>
      </div>

      <PendingOrdersList role={role} />
    </div>
  );
}
