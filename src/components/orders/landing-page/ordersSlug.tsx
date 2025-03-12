"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/utils/formatters";
import Link from "next/link";
import { 
  Clock, CreditCard, ArrowLeft, Box, MapPin, 
  MapPinned, CheckCircle, AlertTriangle, Truck, 
  Loader, RefreshCw
} from "lucide-react";
import { useOrders } from "@/hooks/api/request-order/usePublicOrders";

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

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'confirmed':
      return <CheckCircle className="w-5 h-5 text-blue-500" />;
    case 'processing':
      return <Loader className="w-5 h-5 text-blue-500" />;
    case 'ready_for_delivery':
      return <Truck className="w-5 h-5 text-green-500" />;
    case 'delivered':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'cancelled':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    default:
      return <RefreshCw className="w-5 h-5 text-gray-500" />;
  }
};

const OrderDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const data = await getOrderById(parseInt(id as string));
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Check for payment success from URL query
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowPaymentSuccess(false), 5000);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#E7FAFE] to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-gradient-to-b from-[#E7FAFE] to-white p-6 sm:p-8 min-h-screen flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Error Loading Order</h1>
          <p className="text-center text-red-500">{error || "Order not found"}</p>
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

  const handlePayClick = () => {
    router.push(`/orders/${order.id}/payment`);
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready_for_delivery':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white p-6 sm:p-8 min-h-screen">
      {showPaymentSuccess && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 z-50 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Payment successful! Your order has been updated.</span>
          <button 
            onClick={() => setShowPaymentSuccess(false)}
            className="ml-4 p-1 hover:bg-green-600 rounded"
          >
            ✕
          </button>
        </div>
      )}
    
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg mt-6">
          <div className="bg-orange-500 p-4">
            <h1 className="text-xl font-bold text-white">Order Details</h1>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <h2 className="text-2xl font-bold text-gray-800">WASH-{order.id}</h2>
              <div className="mt-2 md:mt-0 flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusClass(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="ml-1 capitalize">{order.orderStatus.replace(/_/g, " ")}</span>
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2 font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CreditCard className="w-4 h-4 mr-3 text-orange-500" />
                    <span className="text-gray-600">Payment:</span>
                    <span className="ml-2">
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
                  <div className="flex items-start text-sm">
                    <MapPinned className="w-4 h-4 mr-3 text-orange-500 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Service Location:</span>
                      <p className="font-medium mt-1">
                        {order.outlet?.outletName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Delivery Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 mr-3 text-orange-500 mt-1" />
                    <div>
                      <span className="text-gray-600">Delivery Address:</span>
                      <p className="mt-1 text-xs">
                        {order.customerAddress?.addressLine || "Address not available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start text-sm">
                    <Truck className="w-4 h-4 mr-3 text-orange-500 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <p className="font-medium mt-1">
                        {/* Replace with actual estimated delivery if available */}
                        {order.orderStatus === 'completed' ? 'Delivered' : 'Processing'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <Box className="w-4 h-4 mr-2 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-800">Order Items</h3>
              </div>
              <div className="mt-3 bg-gray-50 rounded-lg p-4">
                {order.OrderItem && order.OrderItem.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {order.OrderItem.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between py-3 text-sm"
                      >
                        <span className="font-medium">{item.orderItemName}</span>
                        {item.qty && (
                          <span className="text-gray-500">x{item.qty}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 py-2">No items in this order</p>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Price:</span>
                    <span className="font-bold text-lg text-orange-500">
                      {formatCurrency(order.Payment?.totalPrice ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!order.isPaid && (
              <div className="mt-6">
                <button
                  onClick={handlePayClick}
                  className="w-full py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetail;