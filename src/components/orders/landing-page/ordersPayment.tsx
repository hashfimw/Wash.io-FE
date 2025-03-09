"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatCurrency } from "@/utils/formatters";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { usePayment } from "@/hooks/api/request-order/usePayment";
import { Order } from "@/types/requestOrder";
import { ArrowLeft, CreditCard, Shield, AlertCircle } from "lucide-react";

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
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getOrderById } = useOrders();
  const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayment();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");

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
        const data = await getOrderById(orderId);

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
  }, [id, getOrderById, router]);

  // Load Midtrans Snap script
  useEffect(() => {
    if (window.snap) return;

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.MIDTRANS_CLIENT_KEY!);
    script.onload = () => console.log("Midtrans Snap loaded");
    document.body.appendChild(script);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!order) return;

    try {
      // You can pass the selected payment method to your backend if needed
      const paymentData = await initiatePayment(order.id);

      if (window.snap && paymentData.snapToken) {
        window.snap.pay(paymentData.snapToken, {
          onSuccess: () => {
            // Show success animation before redirecting
            setTimeout(() => {
              router.push(`/orders/${order.id}?payment=success`);
            }, 1500);
          },
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
  }, [order, initiatePayment, router, paymentMethod]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#E7FAFE] to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-[#E7FAFE] to-white p-6 sm:p-8 min-h-screen flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Payment Error</h1>
          <p className="text-center text-red-500">{error}</p>
          <button
            onClick={() => router.push(`/orders`)}
            className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-gradient-to-b from-[#E7FAFE] to-white p-6 sm:p-8 min-h-screen flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <div className="flex items-center justify-center text-gray-500 mb-4">
            <AlertCircle size={48} />
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Order Not Found</h1>
          <p className="text-center text-gray-500">
            We couldn&apos;t find the order you&apos;re looking for.
          </p>
          <button
            onClick={() => router.push(`/orders`)}
            className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Return to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#E7FAFE] to-white p-6 sm:p-8 min-h-screen">
      <div className="max-w-2xl mx-auto pt-20">
        <button
          onClick={() => router.push(`/orders/${order.id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Order Details
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
          <div className="bg-orange-500 p-4">
            <h1 className="text-xl font-bold text-white">Complete Your Payment</h1>
          </div>

          <div className="p-6">
            {paymentError && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
                Order Summary
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="flex justify-between py-2">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">WASH-{order.id}</span>
                </p>
                <p className="flex justify-between py-2 border-t border-gray-200">
                  <span className="text-gray-600">Service:</span>
                  <span>Laundry Pickup & Delivery</span>
                </p>
                {order.laundryWeight && (
                  <p className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-600">Laundry Weight:</span>
                    <span>{order.laundryWeight} kg</span>
                  </p>
                )}
                {order.OrderItem && order.OrderItem.length > 0 && (
                  <div className="py-2 border-t border-gray-200">
                    <p className="text-gray-600 mb-1">Items:</p>
                    <ul className="pl-4">
                      {order.OrderItem.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span>{item.orderItemName}</span>
                          {item.qty && <span>x{item.qty}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {order.Payment && (
                  <p className="flex justify-between py-3 border-t border-gray-200 text-lg font-medium">
                    <span>Total Payment:</span>
                    <span className="text-orange-500">{formatCurrency(order.Payment?.totalPrice)}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={() => setPaymentMethod("credit_card")}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Pay with Visa, Mastercard, or other cards</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-gray-500">Pay via bank transfer</p>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="e_wallet"
                    checked={paymentMethod === "e_wallet"}
                    onChange={() => setPaymentMethod("e_wallet")}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium">E-Wallet</p>
                    <p className="text-sm text-gray-500">GoPay, OVO, DANA, etc.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-500 mb-6">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className={`w-full py-3 rounded-md text-white text-lg font-medium transition-all ${
                paymentLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              }`}
            >
              {paymentLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-3 border-b-2 border-white rounded-full"></span>
                  Processing...
                </span>
              ) : (
                `Pay ${order.Payment ? formatCurrency(order.Payment.totalPrice) : "Now"}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
