// src/hooks/api/orders/usePendingOrders.ts
import { useState, useCallback } from "react";
import { useOrders } from "./useOrders";
import { Order, ApiResponse } from "@/types/order";

// Versi yang lebih sederhana
export const usePendingOrders = () => {
  const {
    loading: ordersLoading,
    error: ordersError,
    getAllOrders,
  } = useOrders();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPendingOrders = useCallback(async () => {
    try {
      setLoading(true);

      // Gunakan getAllOrders untuk semua kasus
      const response = await getAllOrders();

      // Filter untuk status ARRIVED_AT_OUTLET
      const filtered = response.data.data.filter(
        (order) => order.orderStatus === "ARRIVED_AT_OUTLET"
      );

      setPendingOrders(filtered);
      return filtered;
    } catch (err) {
      setError("Failed to fetch pending orders");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAllOrders]);

  return {
    pendingOrders,
    loading: loading || ordersLoading,
    error: error || ordersError,
    getPendingOrders,
  };
};
