// src/hooks/api/orders/useOrders.ts
import { useCallback, useState } from "react";
import axios from "axios";
import { ApiResponse, Order, OrderTrackingResponse } from "@/types/order";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllOrders = useCallback(
    async (outletId?: number): Promise<ApiResponse<Order[]>> => {
      try {
        setLoading(true);
        const queryParams = outletId ? `?outletId=${outletId}` : "";
        const response = await api.get<ApiResponse<Order[]>>(
          `/orders/show-order${queryParams}`
        );
        return response.data;
      } catch (err) {
        setError("Failed to fetch orders");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getOutletOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Order[]>>(
        "/orders/show-order/outlet"
      );
      return response.data.data;
    } catch (err) {
      setError("Failed to fetch outlet orders");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<OrderTrackingResponse>>(
        `/orders/show-order/track/${orderId}`
      );
      return response.data;
    } catch (err) {
      setError("Failed to track order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAllOrders,
    getOutletOrders,
    trackOrder,
  };
};
