"use client";

import { useState, useCallback } from "react";
import useApi from "../useApi";
import { ApiResponse } from "@/types/api";
import axios from "axios";
import { InitiatePaymentResponse, Payment } from "@/types/requestOrder";

export const usePayment = () => {
  const api = useApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initiatePayment = useCallback(
    async (orderId: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post<ApiResponse<InitiatePaymentResponse>>(
          "/payments",
          { orderId }
        );

        return {
          payment: response.data.data.payment,
          snapToken: response.data.data.snapToken,
          redirectUrl: response.data.data.redirectUrl,
        };
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to initiate payment"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const checkPaymentStatus = useCallback(
    async (orderId: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<Payment>>(
          `/payments/${orderId}`
        );

        return response.data.data;
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to check payment status"
          : error instanceof Error
          ? error.message
          : "An unexpected error occurred";

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return {
    loading,
    error,
    initiatePayment,
    checkPaymentStatus,
  };
};
