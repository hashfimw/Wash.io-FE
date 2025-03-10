import { useState } from "react";
import axios from "axios";
import {
  EmployeePerformanceParams,
  EmployeePerformanceResponse,
  SalesReportParams,
  SalesReportResponse,
} from "@/types/reports";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
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

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSalesReport = async (params: SalesReportParams): Promise<SalesReportResponse> => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.outletId) queryParams.append("outletId", params.outletId.toString());
      if (params.period) queryParams.append("period", params.period);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get<SalesReportResponse>(`/reports/sales?${queryParams.toString()}`);

      return response.data;
    } catch (err) {
      console.error("Failed to fetch sales report:", err);
      setError("Failed to fetch sales report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmployeePerformance = async (
    params: EmployeePerformanceParams
  ): Promise<EmployeePerformanceResponse> => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sortList) queryParams.append("sortList", params.sortList);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.outletId) queryParams.append("outletId", params.outletId.toString());

      const response = await api.get<EmployeePerformanceResponse>(
        `/reports/employee-performance?${queryParams.toString()}`
      );

      return response.data;
    } catch (err) {
      console.error("Failed to fetch employee performance report:", err);
      setError("Failed to fetch employee performance report");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getSalesReport,
    getEmployeePerformance,
  };
};
