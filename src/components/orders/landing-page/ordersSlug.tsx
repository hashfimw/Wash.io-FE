"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { formatCurrency, formatDate } from "@/utils/formatters";
import Link from "next/link";
import { Clock, CreditCard, ArrowLeft, Box, MapPin } from "lucide-react";

interface OrderItem {
  id: number;
  orderItemName: string;
  qty?: number;
}

interface Order {
  id: number;
  createdAt: string;
  orderStatus: string;
  isPaid: boolean;
  outlet?: {
    outletName: string;
  };
  customerAddress?: {
    addressLine: string;
  };
  OrderItem?: OrderItem[];
  Payment?: {
    totalPrice: number;
  };
}

const OrderDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const { getPickupOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const data = await getPickupOrder(parseInt(id as string));
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 text-center text-red-500">
        {error || "Order not found"}
      </div>
    );
  }

  const handlePayClick = () => {
    router.push(`/orders/${order.id}/payment`);
  };

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white p-6 sm:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto pt-20">
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg p-6 mt-6">
          <h1 className="text-2xl font-bold text-gray-800">WASH-{order.id}</h1>
          <div className="mt-3 flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <span>Created: {formatDate(order.createdAt)}</span>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
            <span>
              Payment Status:{" "}
              {order.isPaid ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Paid
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Payment Required
                </span>
              )}
            </span>
          </div>
          <div className="mt-3 flex items-start text-sm">
            <MapPin className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">
                {order.outlet?.outletName || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {order.customerAddress?.addressLine || "Address not available"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium">
            Status :{" "}
            <span className="capitalize font-semibold">
              {order.orderStatus.replace(/_/g, " ")}
            </span>
          </p>
          <p className="mt-2 text-sm">
            Total Price : {formatCurrency(order.Payment?.totalPrice ?? 0)}
          </p>

          {/* Order Items */}
          <div className="mt-4">
            <div className="flex flex-row items-center">
              <Box className="w-4 h-4 mr-2 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-800">
                Order Items :
              </h3>
            </div>
            {order.OrderItem && order.OrderItem.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {order.OrderItem.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>{item.orderItemName}</span>
                    {item.qty && (
                      <span className="text-gray-500">x{item.qty}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No items in this order</p>
            )}
          </div>

          {!order.isPaid && (
            <button
              onClick={handlePayClick}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
            >
              Proceed to Payment
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderDetail;
