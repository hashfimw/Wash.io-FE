import { useCallback, useState, useRef } from "react";
import axios from "axios";
import { ApiResponse, OrderParams, OrderResponse, OrderTrackingResponse } from "@/types/order";

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

const cache = {
  orders: new Map(),
  timestamp: new Map(),
  cacheDuration: 0,
};

export const useOrders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastRequestRef = useRef<string | null>(null);

  const getAllOrders = useCallback(async (params: OrderParams = {}): Promise<ApiResponse<OrderResponse>> => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.outletId) queryParams.append("outletId", params.outletId.toString());
      if (params.orderStatus) queryParams.append("orderStatus", params.orderStatus);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.search) queryParams.append("search", params.search);

      const url = `/orders/show-order${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const cacheKey = url;

      const now = Date.now();
      if (
        cache.orders.has(cacheKey) &&
        cache.timestamp.has(cacheKey) &&
        now - cache.timestamp.get(cacheKey)! < cache.cacheDuration
      ) {
        const cachedData = cache.orders.get(cacheKey);
        setLoading(false);
        return cachedData;
      }

      if (lastRequestRef.current === cacheKey) {
        console.log("Skipping duplicate request for:", url);
        setLoading(false);
        if (cache.orders.has(cacheKey)) {
          return cache.orders.get(cacheKey);
        }
      }

      lastRequestRef.current = cacheKey;
      console.log("Fetching orders from:", url);

      const response = await api.get<ApiResponse<OrderResponse>>(url);

      cache.orders.set(cacheKey, response.data);
      cache.timestamp.set(cacheKey, now);

      return response.data;
    } catch (err) {
      setError("Failed to fetch orders");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackOrder = async (orderId: number) => {
    try {
      setLoading(true);

      const cacheKey = `/orders/show-order/track/${orderId}`;
      const now = Date.now();

      if (
        cache.orders.has(cacheKey) &&
        cache.timestamp.has(cacheKey) &&
        now - cache.timestamp.get(cacheKey)! < cache.cacheDuration
      ) {
        setLoading(false);
        return cache.orders.get(cacheKey);
      }

      const response = await api.get<ApiResponse<OrderTrackingResponse>>(cacheKey);

      cache.orders.set(cacheKey, response.data);
      cache.timestamp.set(cacheKey, now);

      return response.data;
    } catch (err) {
      setError("Failed to track order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearOrdersCache = useCallback(() => {
    cache.orders.clear();
    cache.timestamp.clear();
    console.log("Orders cache cleared");
  }, []);

  return {
    loading,
    error,
    getAllOrders,
    trackOrder,
    clearOrdersCache,
  };
};
