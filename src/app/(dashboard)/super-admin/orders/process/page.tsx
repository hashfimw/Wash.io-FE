// src/app/(dashboard)/(routes)/outlet-admin/orders/process/page.tsx

import { PendingOrdersList } from "@/components/orders/process-order/PendingOrderlist";

export default function ProcessOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Process Orders</h2>
        <p className="text-muted-foreground">
          Process customer orders by adding laundry weight and items
        </p>
      </div>

      <PendingOrdersList />
    </div>
  );
}
