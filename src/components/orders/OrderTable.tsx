// src/components/orders/OrderTable.tsx
import { useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import { TableSkeleton } from "../ui/table-skeleton";
import { TablePagination } from "../shared/usePagination";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import SwipeIndicator from "../swipeIndicator";

// Update OrderTable props
interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  isAdmin?: boolean;
  onTrackOrder: (orderId: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OrderTable({
  orders,
  loading,
  error,
  isAdmin,
  onTrackOrder,
  currentPage,
  totalPages,
  onPageChange,
}: OrderTableProps) {
  // Optimasi dengan useCallback
  const handleTrack = useCallback(
    (orderId: number) => {
      onTrackOrder(orderId);
    },
    [onTrackOrder]
  );

  // Tampilkan skeleton saat loading
  if (loading) return <TableSkeleton columns={7} rows={5} />;

  // Tampilkan error jika ada
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4">
      {/* Table container with horizontal scroll on mobile */}
      <div className="rounded-md border overflow-x-auto">
        <SwipeIndicator className="md:hidden" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Outlet</TableHead>
              <TableHead className="lg:px-14">Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-center">Total Price</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Track Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-6">#{order.id}</TableCell>
                  <TableCell>{order.outlet.outletName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {order.orderStatus
                        .toLowerCase()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.OrderItem.length} items</TableCell>
                  <TableCell className="text-center">
                    Rp {order.laundryPrice?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {format(new Date(order.createdAt), "dd/MM/yyyy", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTrack(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No orders available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center mt-4">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={loading}
        />
      </div>
    </div>
  );
}
