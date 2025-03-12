"use client";

import { useState, useCallback, useEffect } from "react";
import { ApiResponse } from "@/types/api";
import useApi from "../useApi";
import { Order, OrderStatus } from "@/types/requestOrder";

export const useOrders = () => {
  const api = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createPickupOrder = useCallback(
    async ({
      addressId,
      outletId,
    }: {
      addressId: number;
      outletId: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const payload = { addressId, outletId };
        const response = await api.post<ApiResponse<Order>>(
          "/pickup-orders",
          payload
        );

        setOrders((prev) => [...prev, response.data.data]);
        setCurrentOrder(response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("Full error object:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const getAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Order[]>>("/pickup-orders");

      setOrders(response.data.data);
      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getOrderById = useCallback(
    async (orderId: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ApiResponse<Order>>(
          `/pickup-orders/${orderId}`
        );

        setCurrentOrder(response.data.data);
        return response.data.data;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const resetOrderState = useCallback(() => {
    setCurrentOrder(null);
    setError(null);
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: number, status: OrderStatus) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.put<ApiResponse<Order>>(
          `/pickup-orders/${orderId}/status`,
          { status }
        );

        const updatedOrder = response.data.data;

        // Update the orders state to reflect the status change
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? updatedOrder : order
          )
        );

        // If this is the current order, update it too
        if (currentOrder && currentOrder.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        if (status === "COMPLETED") {
          console.log("Order has been completed:", updatedOrder);
        }

        return updatedOrder;
      } catch (error) {
        console.error("Error updating order status:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update order status";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api, currentOrder]
  );

  // Add the cancelOrder function based on the backend implementation
  const cancelOrder = useCallback(
    async (orderId: number, { reason }: { reason?: string } = {}) => {
      setLoading(true);
      setError(null);

      try {
        // Use DELETE method to match your backend's deletePickupOrderService
        const response = await api.delete<ApiResponse<{ message: string }>>(
          `/pickup-orders/${orderId}`
        );

        // After successful cancellation, update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { 
                  ...order, 
                  orderStatus: "CANCELLED_BY_CUSTOMER" as OrderStatus,
                  isDeleted: true,
                  deletedAt: new Date().toISOString()
                }
              : order
          )
        );

        // If this is the current order, update it too
        if (currentOrder && currentOrder.id === orderId) {
          setCurrentOrder({
            ...currentOrder,
            orderStatus: "CANCELLED_BY_CUSTOMER" as OrderStatus,
            isDeleted: true,
            deletedAt: new Date().toISOString()
          });
        }

        console.log("Order has been cancelled:", response.data.message);
        
        // Return the updated order structure even though the API doesn't return it
        const cancelledOrder = orders.find(order => order.id === orderId);
        if (cancelledOrder) {
          const updatedOrder = {
            ...cancelledOrder,
            orderStatus: "CANCELLED_BY_CUSTOMER" as OrderStatus,
            isDeleted: true,
            deletedAt: new Date().toISOString()
          };
          return updatedOrder;
        }
        return null;
      } catch (error) {
        console.error("Error cancelling order:", error);
        // Extract error message from API response if available
        let errorMessage: string;
        if (error && typeof error === 'object' && 'response' in error) {
          const responseData = (error as any).response?.data;
          errorMessage = responseData?.message || "Failed to cancel order";
        } else {
          errorMessage = error instanceof Error 
            ? error.message 
            : "Failed to cancel order";
        }
        setError(errorMessage);
        throw new Error(errorMessage); // Throw error to handle in the UI
      } finally {
        setLoading(false);
      }
    },
    [api, currentOrder, orders]
  );

  // Automatically refresh orders at intervals
  useEffect(() => {
    const interval = setInterval(() => {
      getAllOrders();
    }, 60000);

    return () => clearInterval(interval);
  }, [getAllOrders]);

  return {
    orders,
    currentOrder,
    loading,
    error,
    createPickupOrder,
    getAllOrders,
    getOrderById,
    resetOrderState,
    updateOrderStatus,
    cancelOrder, // Export the new cancelOrder function
  };
};