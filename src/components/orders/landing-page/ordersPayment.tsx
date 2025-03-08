"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

import { formatCurrency } from "@/utils/formatters";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { usePayment } from "@/hooks/api/request-order/usePayment";
import { Order } from "@/types/requestOrder";

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // Pastikan id adalah string
  const { getPickupOrder } = useOrders();
  const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayment();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      const orderId = parseInt(id, 10);
      if (isNaN(orderId)) {
        setError("Invalid order ID");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching order with ID:", orderId);
        const data = await getPickupOrder(orderId);
        console.log("Fetched order:", data);

        if (!data) {
          setError("Order not found");
          return;
        }

        setOrder(data);

        if (data.isPaid) {
          router.push(`/orders/${orderId}`);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, getPickupOrder, router]);

  // Load Midtrans Snap script hanya sekali
  useEffect(() => {
    if (window.snap) return;

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""); // Pakai env var
    script.onload = () => console.log("Midtrans Snap loaded");
    document.body.appendChild(script);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!order) return;

    try {
      const paymentData = await initiatePayment(order.id);
      console.log("Payment Data:", paymentData);

      if (window.snap && paymentData.snapToken) {
        window.snap.pay(paymentData.snapToken, {
          onSuccess: () => router.push(`/orders/${order.id}?payment=success`),
          onPending: () => router.push(`/orders/${order.id}?payment=pending`),
          onError: () => router.push(`/orders/${order.id}?payment=error`),
          onClose: () => console.log("Payment popup closed"),
        });
      } else if (paymentData.redirectUrl) {
        window.location.href = paymentData.redirectUrl;
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
    }
  }, [order, initiatePayment, router, setError]);

  if (loading) {
    return <div className="p-6 text-center">Loading payment details...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="p-6 text-center text-red-500">Order not found</div>;
  }

  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white p-6 sm:p-8 min-h-screen">
      <div className="mb-4 pt-20">
        <button
          onClick={() => router.push(`/orders/${order.id}`)}
          className="text-blue-500 flex items-center"
        >
          ← Back to Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        {paymentError && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {paymentError}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="flex justify-between py-2">
              <span>Order ID:</span>
              <span className="font-medium">WASH-{order.id}</span>
            </p>
            <p className="flex justify-between py-2 border-t">
              <span>Service:</span>
              <span>Laundry Pickup & Delivery</span>
            </p>
            {order.laundryWeight && (
              <p className="flex justify-between py-2 border-t">
                <span>Laundry Weight:</span>
                <span>{order.laundryWeight} kg</span>
              </p>
            )}
            {order.Payment && (
              <p className="flex justify-between py-2 border-t text-lg font-medium">
                <span>Total Payment:</span>
                <span>{formatCurrency(order.Payment?.totalPrice)}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className={`w-full py-3 rounded-md text-white text-lg font-medium ${
              paymentLoading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {paymentLoading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
