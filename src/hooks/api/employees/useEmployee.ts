// src/hooks/api/employees/useEmployees.ts
import { useState } from "react";
import axios from "axios";
import {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@/types/employee";
import { ApiResponse } from "@/types/outlet";

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

export const useEmployees = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmployees = async (
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
      setLoading(true);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.search) queryParams.append("search", params.search);
      if (params.role) queryParams.append("role", params.role);
      if (params.outletName)
        queryParams.append("outletName", params.outletName);

      const url = `/adm-employees${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      console.log("Fetching employees from:", url);

      const response = await api.get<ApiResponse<Employee[]>>(url);
      console.log("Employee data:", response.data);

      return {
        employees: response.data.data,
        meta: response.data.meta,
      };
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to fetch employees");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (data: CreateEmployeeInput) => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<Employee>>(
        "/adm-employees",
        data
      );
      return response.data;
    } catch (err) {
      setError("Failed to create employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id: number, data: UpdateEmployeeInput) => {
    try {
      setLoading(true);
      const response = await api.put<ApiResponse<Employee>>(
        `/adm-employees/${id}`,
        data
      );
      return response.data;
    } catch (err) {
      setError("Failed to update employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.delete<ApiResponse<void>>(
        `/adm-employees/${id}`
      );
      return response.data;
    } catch (err) {
      setError("Failed to delete employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignEmployeeToOutlet = async (
    employeeId: number,
    outletId: number
  ) => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<Employee>>(
        "/adm-employees/assign",
        {
          id: employeeId,
          outletId,
        }
      );
      return response.data;
    } catch (err) {
      setError("Failed to assign employee to outlet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reassignMultipleEmployees = async (
    assignments: { id: number; outletId: number }[]
  ) => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<Employee[]>>(
        "/adm-employees/reassign",
        {
          assignments,
        }
      );
      return response.data;
    } catch (err) {
      setError("Failed to reassign employees");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    assignEmployeeToOutlet,
    reassignMultipleEmployees,
  };
};
