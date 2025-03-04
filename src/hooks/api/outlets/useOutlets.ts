import { useState } from "react";
import axios from "axios";
import {
  Outlet,
  CreateOutletInput,
  UpdateOutletInput,
  OutletParams,
  OutletResponse,
  ApiResponse,
} from "@/types/outlet";

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

interface ApiResponseType {
  message: string;
  data: Outlet[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalRecords: number;
  };
}
export const useOutlets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const getOutlets = async (
    params: OutletParams = {}
  ): Promise<ApiResponseType> => {
    try {
      setLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortList) queryParams.append("sortList", params.sortList);

      const url = `/adm-outlets${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await api.get<ApiResponseType>(url);
      setOutlets(response.data.data || []);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch outlets:", err);
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

  const getOutletById = async (id: number): Promise<Outlet | null> => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Outlet>>(`adm-outlets/${id}`);
      return response.data.data;
    } catch (err) {
      console.error(`Failed to fetch outlet with ID ${id}:`, err);
      setError(`Failed to fetch outlet details`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    outlets,
    loading,
    error,
    getOutlets,
    getOutletById,
    createOutlet,
    updateOutlet,
    deleteOutlet,
  };
};
