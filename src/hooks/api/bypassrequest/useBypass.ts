// src/hooks/api/bypass/useBypassRequest.ts
import { useState } from "react";
import axios from "axios";
import {
  ApiResponse,
  BypassRequest,
  BypassRequestInput,
  HandleBypassInput,
} from "@/types/bypass";

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

export const useBypassRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mendapatkan semua permintaan bypass (untuk admin)
  const getBypassRequests = async () => {
    try {
      setLoading(true);
      console.log("Fetching bypass requests");

      const response = await api.get<ApiResponse<BypassRequest[]>>("/bypass");
      console.log("Bypass request data:", response.data);

      return {
        bypassRequests: response.data.data,
      };
    } catch (err) {
      console.error("Error fetching bypass requests:", err);
      setError("Gagal mengambil data permintaan bypass");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mendapatkan detail permintaan bypass berdasarkan ID
  const getBypassRequestById = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<BypassRequest>>(
        `/bypass/${id}`
      );
      return response.data;
    } catch (err) {
      console.error(`Error fetching bypass request with id ${id}:`, err);
      setError("Gagal mengambil detail permintaan bypass");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Worker mengajukan permintaan bypass
  const requestBypass = async (data: BypassRequestInput) => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<BypassRequest>>(
        "/bypass/request",
        data
      );
      return response.data;
    } catch (err) {
      console.error("Error requesting bypass:", err);
      setError("Gagal mengajukan permintaan bypass");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin menangani permintaan bypass (menyetujui/menolak)
  const handleBypassRequest = async (data: HandleBypassInput) => {
    try {
      setLoading(true);
      const response = await api.put<ApiResponse<BypassRequest>>(
        "/bypass/handle",
        data
      );
      return response.data;
    } catch (err) {
      console.error("Error handling bypass request:", err);
      setError("Gagal memproses permintaan bypass");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getBypassRequests,
    getBypassRequestById,
    requestBypass,
    handleBypassRequest,
  };
};
