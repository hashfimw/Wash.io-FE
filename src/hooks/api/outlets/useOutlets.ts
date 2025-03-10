import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { Outlet, CreateOutletInput, UpdateOutletInput, OutletParams, ApiResponse } from "@/types/outlet";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const cache = {
  outlets: new Map(),
  timestamp: new Map(),
  cacheDuration: 0,
};

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
  const lastRequestRef = useRef<string | null>(null);

  const getOutlets = useCallback(async (params: OutletParams = {}): Promise<ApiResponseType> => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortList) queryParams.append("sortOrder", params.sortList);

      const url = `/adm-outlets${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const cacheKey = url;

      const now = Date.now();
      if (
        cache.outlets.has(cacheKey) &&
        cache.timestamp.has(cacheKey) &&
        now - cache.timestamp.get(cacheKey)! < cache.cacheDuration
      ) {
        const cachedData = cache.outlets.get(cacheKey);
        setOutlets(cachedData.data || []);
        return cachedData;
      }

      if (lastRequestRef.current === cacheKey && outlets.length > 0) {
        setLoading(false);
        return {
          message: "From cache",
          data: outlets,
          meta: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: Math.ceil(outlets.length / (params.limit || 10)),
            totalRecords: outlets.length,
          },
        };
      }

      lastRequestRef.current = cacheKey;

      const response = await api.get<ApiResponseType>(url);

      cache.outlets.set(cacheKey, response.data);
      cache.timestamp.set(cacheKey, now);

      setOutlets(response.data.data || []);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch outlets:", err);
      setError("Failed to fetch outlets");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOutlet = useCallback(async (data: CreateOutletInput): Promise<ApiResponse<Outlet>> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<Outlet>>("/adm-outlets", data);

      cache.outlets.clear();
      cache.timestamp.clear();

      return response.data;
    } catch (err) {
      setError("Failed to create outlet");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOutlet = useCallback(
    async (id: number, data: UpdateOutletInput): Promise<ApiResponse<Outlet>> => {
      try {
        setLoading(true);
        const response = await api.put<ApiResponse<Outlet>>(`/adm-outlets/${id}`, data);

        cache.outlets.clear();
        cache.timestamp.clear();

        return response.data;
      } catch (err) {
        setError("Failed to update outlet");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteOutlet = useCallback(async (id: number): Promise<ApiResponse<void>> => {
    try {
      setLoading(true);
      const response = await api.delete<ApiResponse<void>>(`/adm-outlets/${id}`);

      cache.outlets.clear();
      cache.timestamp.clear();

      return response.data;
    } catch (err) {
      setError("Failed to delete outlet");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOutletById = useCallback(async (id: number): Promise<Outlet | null> => {
    try {
      setLoading(true);

      const cacheKey = `adm-outlets/${id}`;
      const now = Date.now();

      if (
        cache.outlets.has(cacheKey) &&
        cache.timestamp.has(cacheKey) &&
        now - cache.timestamp.get(cacheKey)! < cache.cacheDuration
      ) {
        return cache.outlets.get(cacheKey).data;
      }

      const response = await api.get<ApiResponse<Outlet>>(`adm-outlets/${id}`);

      cache.outlets.set(cacheKey, response.data);
      cache.timestamp.set(cacheKey, now);

      return response.data.data;
    } catch (err) {
      console.error(`Failed to fetch outlet with ID ${id}:`, err);
      setError(`Failed to fetch outlet details`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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
