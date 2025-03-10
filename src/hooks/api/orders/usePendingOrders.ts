import { useState, useCallback } from "react";
import { useOrders } from "./useOrders";
import { Order } from "@/types/order";

export const usePendingOrders = () => {
  const { loading: ordersLoading, error: ordersError, getAllOrders } = useOrders();
  const [pendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPendingOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      const filtered = response.data.data.filter((order) => order.orderStatus === "ARRIVED_AT_OUTLET");
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
