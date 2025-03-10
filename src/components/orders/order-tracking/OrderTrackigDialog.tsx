import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderTrackingResponse } from "@/types/order";
import { Timeline } from "./Timeline";
import { Badge } from "@/components/ui/badge";

interface OrderTrackingDialogProps {
  open: boolean;
  onClose: () => void;
  tracking: OrderTrackingResponse | null;
  loading?: boolean;
}

export function OrderTrackingDialog({ open, onClose, tracking, loading }: OrderTrackingDialogProps) {
  if (!tracking && !loading) return null;

  const customerName = tracking?.order?.customerAddress.customer.fullName ?? undefined;
  const customerAddress = tracking?.order?.customerAddress.addressLine;
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
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2">Customer Information</h3>
              <div className="text-sm">
                <p>Name: {customerName || "-"}</p>
                {customerAddress && <p>Address: {customerAddress}</p>}
              </div>
            </div>

            {tracking?.payment && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">Payment Information</h3>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <p>Total: Rp {tracking.payment.totalPrice?.toLocaleString() || "-"}</p>
                    <p>Method: {tracking.payment.paymentMethod || "-"}</p>
                  </div>
                  <div>
                    <Badge
                      className={`
                        ${
                          tracking.payment.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      `}
                    >
                      {tracking.payment.isPaid ? "PAID" : "UNPAID"}
                    </Badge>
                    {tracking.payment.paymentStatus && (
                      <Badge
                        className="ml-2"
                        variant={
                          tracking.payment.paymentStatus === "SUCCEEDED"
                            ? "badgebirtu"
                            : tracking.payment.paymentStatus === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {tracking.payment.paymentStatus}
                      </Badge>
                    )}
                  </div>
                </div>
                {tracking.payment.snapRedirectURL && (
                  <div className="mt-2">
                    <a
                      href={tracking.payment.snapRedirectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-birtu hover:underline"
                    >
                      Go to payment page
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-4">
              <Timeline
                timeline={tracking?.timeline || []}
                orderId={tracking?.order.id}
                customerName={customerName}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
