// src/components/orders/order-tracking/OrderTrackingDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { OrderTrackingResponse } from "@/types/order";
import { Timeline } from "./Timeline";

interface OrderTrackingDialogProps {
  open: boolean;
  onClose: () => void;
  tracking: OrderTrackingResponse | null;
  loading?: boolean;
}

export function OrderTrackingDialog({
  open,
  onClose,
  tracking,
  loading,
}: OrderTrackingDialogProps) {
  if (!tracking && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order #{tracking?.order.id} Tracking</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div>Loading tracking data...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              <Timeline timeline={tracking?.timeline || []} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
