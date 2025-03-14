import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { CreateEmployeeInput, UpdateEmployeeInput } from "@/types/employee";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

const cache = {
  employees: new Map(),
  timestamp: new Map(),
  cacheDuration: 0,
};

export const useEmployees = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestRef = useRef<string | null>(null);

  const getEmployees = useCallback(
    async (
      params: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        search?: string;
        role?: string;
        outletName?: string;
      } = {}
    ) => {
      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.role) queryParams.append("role", params.role);
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
        if (params.outletName) queryParams.append("outletName", params.outletName);

        const url = `/adm-employees${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

        const cacheKey = url;

        setLoading(true);
        const now = Date.now();
        if (
          cache.employees.has(cacheKey) &&
          cache.timestamp.has(cacheKey) &&
          now - cache.timestamp.get(cacheKey)! < cache.cacheDuration
        ) {
          console.log("Returning cached employee data for:", url);
          const cachedData = cache.employees.get(cacheKey);
          setLoading(false);
          return cachedData;
        }

        if (lastRequestRef.current === cacheKey) {
          console.log("Skipping duplicate request for:", url);
          setLoading(false);
          if (cache.employees.has(cacheKey)) {
            return cache.employees.get(cacheKey);
          }
        }

        lastRequestRef.current = cacheKey;
        console.log("Fetching employees from:", url);

        const response = await api.get(url);
        const responseData = {
          employees: response.data.data,
          meta: response.data.meta,
        };

        cache.employees.set(cacheKey, responseData);
        cache.timestamp.set(cacheKey, now);

        console.log("Employee data fetched:", responseData);
        setLoading(false);

        return responseData;
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to fetch employees");
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const createEmployee = useCallback(async (data: CreateEmployeeInput) => {
    try {
      setLoading(true);
      const response = await api.post("/adm-employees", data);

      cache.employees.clear();
      cache.timestamp.clear();

      return response.data;
    } catch (err) {
      setError("Failed to create employee");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEmployee = useCallback(async (id: number, data: UpdateEmployeeInput) => {
    try {
      setLoading(true);
      const response = await api.put(`/adm-employees/${id}`, data);

      cache.employees.clear();
      cache.timestamp.clear();

      return response.data;
    } catch (err) {
      setError("Failed to update employee");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEmployee = useCallback(async (id: number) => {
    try {
      setLoading(true);
      const response = await api.delete(`/adm-employees/${id}`);

      cache.employees.clear();
      cache.timestamp.clear();

      return response.data;
    } catch (err) {
      setError("Failed to delete employee");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
