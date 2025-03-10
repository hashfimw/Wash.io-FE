import { useState } from "react";
import axios from "axios";
import { OrderItem } from "@/types/order";
import { ApiResponse } from "@/types/outlet";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useLaundryItems = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLaundryItems = async (): Promise<ApiResponse<OrderItem[]>> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<OrderItem[]>>("/orders/items");
      return response.data;
    } catch (err) {
      console.error("Failed to fetch laundry items:", err);
      setError("Failed to fetch laundry items");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createLaundryItem = async (orderItemName: string): Promise<ApiResponse<OrderItem>> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<ApiResponse<OrderItem>>("/orders/items", {
        orderItemName,
      });
      return response.data;
    } catch (err) {
      console.error("Failed to create laundry item:", err);
      setError("Failed to create laundry item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLaundryItem = async (id: number, orderItemName: string): Promise<ApiResponse<OrderItem>> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put<ApiResponse<OrderItem>>(`/orders/items/${id}`, {
        orderItemName,
      });
      return response.data;
    } catch (err) {
      console.error(`Failed to update laundry item with ID ${id}:`, err);
      setError("Failed to update laundry item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLaundryItem = async (id: number): Promise<ApiResponse<void>> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete<ApiResponse<void>>(`/orders/items/${id}`);
      return response.data;
    } catch (err) {
      console.error(`Failed to delete laundry item with ID ${id}:`, err);
      setError("Failed to delete laundry item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getLaundryItems,
    createLaundryItem,
    updateLaundryItem,
    deleteLaundryItem,
  };
};
