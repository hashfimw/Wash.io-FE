import { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ApiResponse, Payment } from '@/types/requestOrder';

interface InitiatePaymentResponse extends ApiResponse<{
  payment: Payment;
  snapToken?: string;
  redirectUrl?: string;
}> {}

export const usePayment = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Gunakan useMemo agar instance axios tidak dibuat ulang setiap kali hook dipanggil
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    });

    // Interceptor untuk menyertakan token otorisasi
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, []);

  /**
   * Initiate payment for an order
   * @param orderId - ID pesanan yang akan dibayar
   */
  const initiatePayment = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<InitiatePaymentResponse>('/payments/initiate', { orderId });
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to initiate payment');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  /**
   * Check payment status
   * @param orderId - ID pesanan untuk mengecek status pembayaran
   */
  const checkPaymentStatus = useCallback(async (orderId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Payment>>(`/payments/status/${orderId}`);
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to check payment status');
      } else {
        setError('An unexpected error occurred');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    loading,
    error,
    initiatePayment,
    checkPaymentStatus,
  };
};
