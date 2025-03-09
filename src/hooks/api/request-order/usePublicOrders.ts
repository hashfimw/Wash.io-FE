"use client"

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
    async ({ addressId, outletId }: { addressId: number; outletId: number }) => {
      setLoading(true);
      setError(null);
      try {
        const payload = { addressId, outletId };
        console.log("Sending payload:", payload);
        
        const response = await api.post<ApiResponse<Order>>(
          "/pickup-orders", 
          payload
        );
        
        console.log("API Response:", response.data);
        
        setOrders((prev) => [...prev, response.data.data]);
        setCurrentOrder(response.data.data);
        return response.data.data;
      } catch (error) {
        console.error("Full error object:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
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
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
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
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
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
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
        
        // If this is the current order, update it too
        if (currentOrder && currentOrder.id === orderId) {
          setCurrentOrder(updatedOrder);
        }
        
        // If the status is COMPLETED, you can add any special handling here
        if (status === "COMPLETED") {
          // For example, you might want to refresh the orders list
          // or trigger some notification
          console.log("Order has been completed:", updatedOrder);
          // You could also call a function to handle completed orders
          // handleCompletedOrder(updatedOrder);
        }
        
        return updatedOrder;
      } catch (error) {
        console.error("Error updating order status:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update order status";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api, currentOrder]
  );

  // Function to handle completed orders if needed
  const handleCompletedOrder = useCallback((order: Order) => {
    // Implement any special logic for completed orders
    // For example, you might want to move it to a different list
    // or update some UI elements
    console.log("Handling completed order:", order);
  }, []);

  // Automatically refresh orders at intervals (optional)
  useEffect(() => {
    // You could add auto-refresh logic here if needed
    // const interval = setInterval(() => {
    //   getAllOrders();
    // }, 60000); // Refresh every minute
    // 
    // return () => clearInterval(interval);
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
  };
};