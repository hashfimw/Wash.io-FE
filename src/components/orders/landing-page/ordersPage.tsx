"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Order } from "@/types/requestOrder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Loader2,
  Search,
  PlusCircle,
  MapPinned,
  CreditCard,
  Box,
  Clock,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { formatDate } from "@/utils/formatters";
import { CompleteOrderButton } from "./orders-page/completeOrderButton";

export default function OrdersPage() {
  const { orders, loading, error, getAllOrders } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  useEffect(() => {
    if (orders.length > 0) {
      // Filter orders based on search query
      const filtered = orders.filter((order) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          order.id.toString().includes(searchLower) ||
          (order.outlet?.outletName || "")
            .toLowerCase()
            .includes(searchLower) ||
          order.orderStatus.toLowerCase().includes(searchLower) ||
          (order.customerAddress?.addressLine || "")
            .toLowerCase()
            .includes(searchLower) ||
          order.OrderItem?.some((item) =>
            item.orderItemName.toLowerCase().includes(searchLower)
          )
        );
      });
      setFilteredOrders(filtered);
    }
  }, [orders, searchQuery]);

  const handleOrderComplete = (updatedOrder: Order) => {
    // Update both the main orders list and the filtered orders list
    const updatedOrders = orders.map((order) => 
      order.id === updatedOrder.id ? {...order, orderStatus: "COMPLETED"} : order
    );
    
    // Update the filtered orders list
    setFilteredOrders((prev) =>
      prev.map((order) => 
        order.id === updatedOrder.id ? {...order, orderStatus: "COMPLETED"} : order
      )
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "received_by_customer":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled_by_customer":
      case "cancelled_by_outlet":
        return "bg-red-100 text-red-800";
      case "pending":
      case "waiting_for_pickup_driver":
      case "waiting_for_delivery_driver":
        return "bg-yellow-100 text-yellow-800";
      case "on_the_way_to_customer":
      case "on_the_way_to_outlet":
      case "being_washed":
      case "being_ironed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#E7FAFE] to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center mx-auto max-w-4xl">
        <p>Error loading orders: {error}</p>
        <Button
          variant="outline"
          className="mt-2 text-sm"
          onClick={() => getAllOrders()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white p-4 sm:p-6 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 mt-20">
          Your <span className="text-orange-500">Laundry</span> Orders
        </h2>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6 sm:mb-8">
          <div className="flex items-center border-2 border-gray-300 rounded-full bg-white overflow-hidden pl-3 sm:pl-4 pr-2 py-1.5 sm:py-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-1 sm:mr-2" />
            <input
              type="text"
              placeholder="Search orders by ID, outlet, or status..."
              className="w-full text-sm sm:text-base outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* New Order Button */}
        <div className="flex items-start justify-end mb-6">
          <Link href="/new-order">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <PlusCircle className="mr-2" />
              New Order
            </Button>
          </Link>
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">
                No Orders Found
              </h3>
              <p className="text-gray-500 mt-1">
                {searchQuery
                  ? "No orders match your search criteria."
                  : "You haven't placed any orders yet."}
              </p>
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                <Link href="/new-order">Create New Order</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {currentItems.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden border border-gray-100 transition-all hover:shadow-lg"
              >
                <CardContent className="p-4 sm:p-5">
                  {/* Header with Order # and Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="font-bold text-base sm:text-lg">
                        WASH-{order.id}
                      </span>
                      <span
                        className={`ml-3 px-2 py-1 rounded-full text-xs ${getStatusStyle(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      {/* Outlet Info */}
                      <div className="flex items-start">
                        <MapPinned className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            {order.outlet?.outletName || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
                        <div className="flex items-center">
                          <span className="text-sm mr-2">Payment:</span>
                          {order.isPaid ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Paid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Payment Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      {order.OrderItem && order.OrderItem.length > 0 ? (
                        <div>
                          <div className="flex items-center mb-1.5">
                            <Box className="w-4 h-4 mr-2 text-orange-500" />
                            <p className="text-sm font-medium">Order Items:</p>
                          </div>
                          <ul className="pl-6 text-sm space-y-1">
                            {order.OrderItem.slice(0, 3).map((item) => (
                              <li
                                key={item.id}
                                className="flex justify-between"
                              >
                                <span>{item.orderItemName}</span>
                                {item.qty && (
                                  <span className="text-gray-500">
                                    x{item.qty}
                                  </span>
                                )}
                              </li>
                            ))}
                            {order.OrderItem.length > 3 && (
                              <li className="text-xs text-orange-500">
                                +{order.OrderItem.length - 3} more items
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No items in this order
                        </p>
                      )}

                      {order.laundryWeight && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <Box className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="text-sm">
                              Weight: {order.laundryWeight} kg
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t flex justify-between">
                    <div>
                      {/* Complete button - only shows for "received_by_customer" status */}
                      {order.orderStatus.toLowerCase() === "received_by_customer" ? (
                        <CompleteOrderButton
                          order={order}
                          onComplete={handleOrderComplete}
                          className="text-sm bg-green-500 hover:bg-green-600 flex items-center"
                        />
                      ) : order.orderStatus.toLowerCase() === "completed" && (
                        <Button 
                          className="text-sm bg-green-100 text-green-800 hover:bg-green-100 flex items-center"
                          disabled
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 sm:space-x-3">
                      <Link href={`/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          className="text-sm flex items-center"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </Button>
                      </Link>
                      {!order.isPaid && (
                        <Link href={`/orders/${order.id}/payment`}>
                          <Button className="text-sm bg-orange-500 hover:bg-orange-600">
                            Pay Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {filteredOrders.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm sm:text-base px-2">
                  Page {currentPage} of{" "}
                  {Math.ceil(filteredOrders.length / itemsPerPage)}
                </div>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={indexOfLastItem >= filteredOrders.length}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}