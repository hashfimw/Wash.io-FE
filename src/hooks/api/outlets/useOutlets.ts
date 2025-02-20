import { useState } from "react";
import axios from "axios";
import {
  Outlet,
  CreateOutletInput,
  UpdateOutletInput,
  ApiResponse,
} from "@/types/outlet";
import { set } from "zod";

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

export const useOutlets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const getOutlets = async (): Promise<ApiResponse<Outlet[]>> => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Outlet[]>>("/adm-outlets");
      setOutlets(response.data.data);
      return response.data;
    } catch (err) {
      setError("Failed to fetch outlets");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createOutlet = async (
    data: CreateOutletInput
  ): Promise<ApiResponse<Outlet>> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<Outlet>>(
        "/adm-outlets",
        data
      );
      return response.data;
    } catch (err) {
      setError("Failed to create outlet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOutlet = async (
    id: number,
    data: UpdateOutletInput
  ): Promise<ApiResponse<Outlet>> => {
    try {
      setLoading(true);
      const response = await api.put<ApiResponse<Outlet>>(
        `/adm-outlets/${id}`,
        data
      );
      return response.data;
    } catch (err) {
      setError("Failed to update outlet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOutlet = async (id: number): Promise<ApiResponse<void>> => {
    try {
      setLoading(true);
      const response = await api.delete<ApiResponse<void>>(
        `/adm-outlets/${id}`
      );
      return response.data;
    } catch (err) {
      setError("Failed to delete outlet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    outlets,
    loading,
    error,
    getOutlets,
    createOutlet,
    updateOutlet,
    deleteOutlet,
  };
};
