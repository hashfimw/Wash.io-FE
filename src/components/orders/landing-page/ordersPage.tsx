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
  ChevronRight,
  X,
  AlertTriangle,
  Ban,
  Info
} from "lucide-react";

import { useOrders } from "@/hooks/api/request-order/usePublicOrders";
import { formatDate } from "@/utils/formatters";
import { CompleteOrderButton } from "./orders-page/completeOrderButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Define enum to match the schema
enum OrderStatus {
  ARRIVED_AT_OUTLET = "ARRIVED_AT_OUTLET",
  READY_FOR_WASHING = "READY_FOR_WASHING",
  BEING_WASHED = "BEING_WASHED",
  WASHING_COMPLETED = "WASHING_COMPLETED",
  BEING_IRONED = "BEING_IRONED",
  IRONING_COMPLETED = "IRONING_COMPLETED",
  BEING_PACKED = "BEING_PACKED",
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  READY_FOR_DELIVERY = "READY_FOR_DELIVERY",
  WAITING_FOR_DELIVERY_DRIVER = "WAITING_FOR_DELIVERY_DRIVER",
  BEING_DELIVERED_TO_CUSTOMER = "BEING_DELIVERED_TO_CUSTOMER",
  RECEIVED_BY_CUSTOMER = "RECEIVED_BY_CUSTOMER",
  COMPLETED = "COMPLETED",
  CANCELLED_BY_CUSTOMER = "CANCELLED_BY_CUSTOMER",
  CANCELLED_BY_OUTLET = "CANCELLED_BY_OUTLET",
  WAITING_FOR_PICKUP_DRIVER = "WAITING_FOR_PICKUP_DRIVER",
  ON_THE_WAY_TO_CUSTOMER = "ON_THE_WAY_TO_CUSTOMER",
  ON_THE_WAY_TO_OUTLET = "ON_THE_WAY_TO_OUTLET"
}

export default function OrdersPage() {
  const { orders, loading, error, getAllOrders, cancelOrder } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { toast } = useToast();

  // Cancel order dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Status info dialog
  const [statusInfoOpen, setStatusInfoOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  useEffect(() => {
    if (orders.length > 0) {
      const filtered = orders.filter((order) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          order.id.toString().includes(searchLower) ||
          (order.outlet?.outletName || "").toLowerCase().includes(searchLower) ||
          order.orderStatus.toLowerCase().includes(searchLower) ||
          (order.customerAddress?.addressLine || "").toLowerCase().includes(searchLower) ||
          order.OrderItem?.some((item) => item.orderItemName.toLowerCase().includes(searchLower))
        );
      });
      setFilteredOrders(filtered);
      // Reset to first page when search results change
      setCurrentPage(1);
    }
  }, [orders, searchQuery]);

  const handleOrderComplete = (updatedOrder: Order) => {
    const updatedOrders = orders.map((order) => 
      order.id === updatedOrder.id ? {...order, orderStatus: OrderStatus.COMPLETED} : order
    );
    
    // Update the filtered orders list
    setFilteredOrders((prev) =>
      prev.map((order) => 
        order.id === updatedOrder.id ? {...order, orderStatus: OrderStatus.COMPLETED} : order
      )
    );
  };

  // Function to open the cancel dialog
  const openCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
    setCancelReason("");
  };
  
  // Function to open status info dialog
  const openStatusInfo = (order: Order) => {
    setSelectedOrder(order);
    setStatusInfoOpen(true);
  };

  // Function to handle order cancellation
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setIsCancelling(true);
    
    try {
      // Call the API to cancel the order
      await cancelOrder(orderToCancel.id, { reason: cancelReason });
      
      // Update the local state to reflect the cancellation
      const updatedOrders = orders.map((order) => 
        order.id === orderToCancel.id 
          ? {...order, orderStatus: OrderStatus.CANCELLED_BY_CUSTOMER} 
          : order
      );
      
      // Update the filtered orders list
      setFilteredOrders((prev) =>
        prev.map((order) => 
          order.id === orderToCancel.id 
            ? {...order, orderStatus: OrderStatus.CANCELLED_BY_CUSTOMER} 
            : order
        )
      );
      
      toast({
        title: "Order Cancelled",
        description: `Order #WASH-${orderToCancel.id} has been cancelled.`,
        variant: "default",
      });
      
      // Close the dialog
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast({
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive", 
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if an order can be cancelled
  const canCancelOrder = (order: Order): boolean => {
    // Define statuses that allow cancellation based on your schema
    const cancellableStatuses = [
      OrderStatus.WAITING_FOR_PICKUP_DRIVER,
      OrderStatus.WAITING_FOR_DELIVERY_DRIVER,
      OrderStatus.READY_FOR_WASHING,
      OrderStatus.AWAITING_PAYMENT
    ];
    
    // Check if the order status is in the cancellable list
    return cancellableStatuses.includes(order.orderStatus as OrderStatus);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case OrderStatus.RECEIVED_BY_CUSTOMER:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED_BY_CUSTOMER:
      case OrderStatus.CANCELLED_BY_OUTLET:
        return "bg-red-100 text-red-800";
      case OrderStatus.WAITING_FOR_PICKUP_DRIVER:
      case OrderStatus.WAITING_FOR_DELIVERY_DRIVER:
      case OrderStatus.AWAITING_PAYMENT:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.ON_THE_WAY_TO_CUSTOMER:
      case OrderStatus.ON_THE_WAY_TO_OUTLET:
        return "bg-purple-100 text-purple-800";
      case OrderStatus.BEING_WASHED:
      case OrderStatus.BEING_IRONED:
      case OrderStatus.BEING_PACKED:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.WASHING_COMPLETED:
      case OrderStatus.IRONING_COMPLETED:
      case OrderStatus.READY_FOR_DELIVERY:
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get a human readable status description
  const getStatusDescription = (status: string): string => {
    switch (status) {
      case OrderStatus.WAITING_FOR_PICKUP_DRIVER:
        return "We're assigning a driver to pick up your laundry.";
      case OrderStatus.WAITING_FOR_DELIVERY_DRIVER:
        return "We're assigning a driver to deliver your clean laundry.";
      case OrderStatus.ON_THE_WAY_TO_CUSTOMER:
        return "Your laundry is on the way to your location.";
      case OrderStatus.ON_THE_WAY_TO_OUTLET:
        return "Your laundry is being transported to our outlet.";
      case OrderStatus.ARRIVED_AT_OUTLET:
        return "Your laundry has arrived at our outlet.";
      case OrderStatus.READY_FOR_WASHING:
        return "Your laundry is prepared and ready to be washed.";
      case OrderStatus.BEING_WASHED:
        return "Your laundry is currently being washed.";
      case OrderStatus.WASHING_COMPLETED:
        return "Washing is complete. Moving to the next stage.";
      case OrderStatus.BEING_IRONED:
        return "Your clothes are being ironed.";
      case OrderStatus.IRONING_COMPLETED:
        return "Ironing is complete. Moving to the next stage.";
      case OrderStatus.BEING_PACKED:
        return "Your laundry is being packed for delivery.";
      case OrderStatus.AWAITING_PAYMENT:
        return "Your order is awaiting payment before we can proceed.";
      case OrderStatus.READY_FOR_DELIVERY:
        return "Your laundry is clean and ready for delivery.";
      case OrderStatus.RECEIVED_BY_CUSTOMER:
        return "Your laundry has been delivered. Please confirm completion when you're satisfied.";
      case OrderStatus.COMPLETED:
        return "Your order is complete. Thank you for using our service!";
      case OrderStatus.CANCELLED_BY_CUSTOMER:
        return "This order was cancelled by you.";
      case OrderStatus.CANCELLED_BY_OUTLET:
        return "This order was cancelled by our outlet. Please contact support for details.";
      default:
        return "Processing your order.";
    }
  };

  const formatOrderStatus = (status: string): string => {
    return status.replace(/_/g, " ")
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

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
      <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center mx-auto max-w-4xl mt-24">
        <p>Error loading orders: {error}</p>
        <Button variant="outline" className="mt-2 text-sm" onClick={() => getAllOrders()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-b from-[#E7FAFE] to-white p-4 pt-16 sm:p-6 md:py-12">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 mt-16 sm:mt-20">
          Your <span className="text-orange-500">Laundry</span> Orders
        </h2>

        {/* Search and Add Button Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1">
            <div className="flex items-center border-2 border-gray-300 rounded-full bg-white overflow-hidden pl-3 sm:pl-4 pr-2 py-1.5 sm:py-2">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full text-sm outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* New Order Button */}
          <Link href="/new-order" className="w-full sm:w-auto">
            <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto justify-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="p-6 text-center">
              <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">No Orders Found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery ? "No orders match your search criteria." : "You haven't placed any orders yet."}
              </p>
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                <Link href="/new-order">Create New Order</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {currentItems.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden border border-gray-100 transition-all hover:shadow-md"
              >
                <CardContent className="p-3 sm:p-5">
                  {/* Header with Order # and Status */}
                  <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-bold text-sm sm:text-base">WASH-{order.id}</span>
                      <Badge 
                        className={`font-normal ${getStatusStyle(order.orderStatus)}`}
                        onClick={() => openStatusInfo(order)}
                      >
                        <span className="flex items-center cursor-pointer">
                          {formatOrderStatus(order.orderStatus)}
                          <Info className="ml-1 w-3 h-3" />
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
                      <Clock className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      {/* Outlet Info */}
                      <div className="flex items-start">
                        <MapPinned className="w-4 h-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{order.outlet?.outletName || "N/A"}</p>
                        </div>
                      </div>

                      {/* Payment Status */}
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
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
                          <div className="flex items-center mb-1">
                            <Box className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                            <p className="text-sm font-medium">Order Items:</p>
                          </div>
                          <ul className="pl-6 text-sm space-y-1">
                            {order.OrderItem.slice(0, 2).map((item) => (
                              <li key={item.id} className="flex justify-between">
                                <span className="line-clamp-1 mr-2">{item.orderItemName}</span>
                                {item.qty && <span className="text-gray-500 flex-shrink-0">x{item.qty}</span>}
                              </li>
                            ))}
                            {order.OrderItem.length > 2 && (
                              <li className="text-xs text-orange-500">
                                +{order.OrderItem.length - 2} more items
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No items in this order</p>
                      )}

                      {order.laundryWeight && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <Box className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                            <span className="text-sm">Weight: {order.laundryWeight} kg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile View: Link to details */}
                  <div className="sm:hidden mt-3 border-t pt-3">
                    <Link href={`/orders/${order.id}`} className="w-full">
                      <Button variant="outline" className="w-full text-sm justify-center">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Desktop: Action Buttons */}
                  <div className="hidden sm:flex mt-4 pt-3 border-t justify-between">
                    <div>
                      {order.orderStatus === OrderStatus.RECEIVED_BY_CUSTOMER ? (
                        <CompleteOrderButton
                          order={order}
                          onComplete={handleOrderComplete}
                          className="text-sm bg-green-500 hover:bg-green-600 flex items-center"
                        />
                      ) : order.orderStatus === OrderStatus.COMPLETED && (
                        <Button 
                          className="text-sm bg-green-100 text-green-800 hover:bg-green-100 flex items-center"
                          disabled
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </Button>
                      )}
                      
                      {/* Cancel button for desktop */}
                      {canCancelOrder(order) && (
                        <Button 
                          variant="outline"
                          className="text-sm border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
                          onClick={() => openCancelDialog(order)}
                        >
                          <X className="mr-1.5 h-4 w-4" />
                          Cancel Order
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" className="text-sm flex items-center">
                          View Details
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </Button>
                      </Link>
                      {!order.isPaid && 
                       order.orderStatus !== OrderStatus.CANCELLED_BY_CUSTOMER && 
                       order.orderStatus !== OrderStatus.CANCELLED_BY_OUTLET && (
                        <Link href={`/orders/${order.id}/payment`}>
                          <Button className="text-sm bg-orange-500 hover:bg-orange-600">Pay Now</Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Additional Actions Button Group */}
                  <div className="sm:hidden mt-2 flex space-x-2">
                    {order.orderStatus === OrderStatus.RECEIVED_BY_CUSTOMER && (
                      <CompleteOrderButton
                        order={order}
                        onComplete={handleOrderComplete}
                        className="flex-1 text-xs bg-green-500 hover:bg-green-600 flex items-center justify-center"
                      />
                    )}
                    
                    {!order.isPaid && 
                     order.orderStatus !== OrderStatus.CANCELLED_BY_CUSTOMER && 
                     order.orderStatus !== OrderStatus.CANCELLED_BY_OUTLET && (
                      <Link href={`/orders/${order.id}/payment`} className="flex-1">
                        <Button className="w-full text-xs bg-orange-500 hover:bg-orange-600 flex items-center justify-center">
                          Pay Now
                        </Button>
                      </Link>
                    )}
                    
                    {/* Cancel button for mobile */}
                    {canCancelOrder(order) && (
                      <Button 
                        variant="outline"
                        className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
                        onClick={() => openCancelDialog(order)}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {filteredOrders.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  Previous
                </Button>
                <div className="text-xs sm:text-sm px-2">
                  Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}
                </div>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm px-2 sm:px-4"
                  size="sm"
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
      
      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            {orderToCancel && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Order Details:</p>
                <p className="text-sm">Order ID: WASH-{orderToCancel.id}</p>
                <p className="text-sm">Status: {formatOrderStatus(orderToCancel.orderStatus)}</p>
                <p className="text-sm">
                  Outlet: {orderToCancel.outlet?.outletName || "N/A"}
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="cancel-reason" className="block text-sm font-medium mb-1.5">
                Reason for cancellation:
              </label>
              <textarea
                id="cancel-reason"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                rows={3}
                placeholder="Please explain why you're cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              Keep Order
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Status Info Dialog */}
      <Dialog open={statusInfoOpen} onOpenChange={setStatusInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Info className="h-5 w-5 text-blue-500 mr-2" />
              Order Status Information
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            {selectedOrder && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <Badge className={`font-normal ${getStatusStyle(selectedOrder.orderStatus)} mr-2 text-xs`}>
                    {formatOrderStatus(selectedOrder.orderStatus)}
                  </Badge>
                  <span className="text-sm text-gray-500">Order #{selectedOrder.id}</span>
                </div>
                
                <p className="text-sm text-gray-700">
                  {getStatusDescription(selectedOrder.orderStatus)}
                </p>
                
                <div className="bg-blue-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">What happens next?</h4>
                  <p className="text-xs text-blue-700">
                    {selectedOrder.orderStatus === OrderStatus.WAITING_FOR_PICKUP_DRIVER && 
                      "A driver will be assigned to pick up your laundry. You'll be notified when they're on their way."}
                    {selectedOrder.orderStatus === OrderStatus.ON_THE_WAY_TO_CUSTOMER && 
                      "Your driver is on their way to deliver your clean laundry. Please be ready to receive it."}
                    {selectedOrder.orderStatus === OrderStatus.RECEIVED_BY_CUSTOMER && 
                      "Please check your laundry and mark the order as complete when you're satisfied."}
                    {selectedOrder.orderStatus === OrderStatus.COMPLETED && 
                      "Your order is complete! We hope you're satisfied with our service."}
                    {selectedOrder.orderStatus === OrderStatus.CANCELLED_BY_CUSTOMER && 
                      "This order has been cancelled. You can place a new order if needed."}
                    {(selectedOrder.orderStatus === OrderStatus.BEING_WASHED || 
                      selectedOrder.orderStatus === OrderStatus.BEING_IRONED || 
                      selectedOrder.orderStatus === OrderStatus.BEING_PACKED) && 
                      "Your laundry is being processed. We'll take good care of your clothes."}
                    {selectedOrder.orderStatus === OrderStatus.AWAITING_PAYMENT && 
                      "Please complete payment to proceed with your order."}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStatusInfoOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}