import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ApiResponse, Order } from '@/types/requestOrder';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Interceptor untuk token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get all user orders
  const getAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Order[]>>('/pickup-orders');
      setOrders(response.data.data);
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch orders');
      } else {
        setError('An unexpected error occurred');
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific pickup order
  const getPickupOrder = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Order>>(`/pickup-orders/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to fetch pickup order');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a pickup order
  const createPickupOrder = useCallback(async (addressId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<ApiResponse<Order>>('/pickup-orders', { addressId });
      await getAllOrders();
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create pickup order');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAllOrders]);

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  return {
    orders,
    loading,
    error,
    getAllOrders,
    getPickupOrder,
    createPickupOrder,
  };
};
