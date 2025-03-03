import axios from "axios";
import { useState } from "react";
import { AttendanceType, GetAttendancesRequest, GetAttendancesResponse, GetEmployeeStatusResponse } from "@/types/attendance";

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

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAttendances = async (params: GetAttendancesRequest) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      else if (!params.endDate) queryParams.append("endDate", new Date().toISOString());
      if (params.attendanceType) queryParams.append("attendanceType", params.attendanceType);
      if (params.name) queryParams.append("name", params.name);
      if (params.role) queryParams.append("role", params.role);
      if (params.workShift) queryParams.append("workShift", params.workShift);
      if (params.outletName) queryParams.append("outletName", params.outletName);

      const response = await api.get<GetAttendancesResponse>(`/attendances?${queryParams}`);

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to fetch attendances");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAttendance = async (attendanceType: AttendanceType) => {
    try {
      setLoading(true);

      const response = await api.post<{ message: string }>(`/attendances?attendanceType=${attendanceType}`);

      return response.data.message;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to create attendance");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkIsNull = async () => {
    try {
      setLoading(true);

      const response = await api.get<{ data: { count: number } }>(`/attendances/check`);

      return response.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to create attendance");
      throw err;
    }
  };

  const getEmployeeStatus = async () => {
    try {
      setLoading(true);

      const response = await api.get<GetEmployeeStatusResponse>(`/attendances/check`);

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to create attendance");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAttendances,
    createAttendance,
    checkIsNull,
    getEmployeeStatus,
  };
};
