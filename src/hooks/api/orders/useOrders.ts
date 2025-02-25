// src/hooks/api/orders/useOrders.ts
import { useCallback, useState } from "react";
import axios from "axios";
import {
  ApiResponse,
  Order,
  OrderParams,
  OrderResponse,
  OrderTrackingResponse,
} from "@/types/order";

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
    async (params: OrderParams = {}): Promise<ApiResponse<OrderResponse>> => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.outletId)
          queryParams.append("outletId", params.outletId.toString());
        if (params.orderStatus)
          queryParams.append("orderStatus", params.orderStatus);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);

        const url = `/orders/show-order${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        const response = await api.get<ApiResponse<OrderResponse>>(url);
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
    trackOrder,
  };
};
