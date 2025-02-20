// src/components/orders/OrderTable.tsx
import { useState } from "react";
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
import { Order } from "@/types/order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "../ui/table-skeleton";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  isAdmin?: boolean;
  outlets?: { id: number; outletName: string }[];
  onOutletChange?: (outletId: number | undefined) => void;
  onTrackOrder: (orderId: number) => void;
}

export function OrderTable({
  orders,
  loading,
  error,
  isAdmin,
  outlets,
  onOutletChange,
  onTrackOrder,
}: OrderTableProps) {
  if (loading) return <TableSkeleton columns={7} rows={5} />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  console.log("Orders in table:", orders);
  if (!orders || !Array.isArray(orders)) {
    return <div className="text-center py-4">No orders available</div>;
  }

  return (
    <div className="space-y-4">
      {isAdmin && outlets && (
        <Select
          onValueChange={(value) =>
            onOutletChange?.(value ? parseInt(value) : undefined)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by outlet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all outlets">All Outlets</SelectItem>
            {outlets.map((outlet) => (
              <SelectItem key={outlet.id} value={outlet.id.toString()}>
                {outlet.outletName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="rounded-md border">
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
            {orders.map((order) => (
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
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTrackOrder(order.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
