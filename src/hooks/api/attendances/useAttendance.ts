import axios from "axios";
import { useState } from "react";
import { GetAttendancesRequest, GetAttendancesResponse, GetEmployeeStatusResponse } from "@/types/attendance";

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
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const tzo = new Date().getTimezoneOffset().toString();

  const getAttendances = async (params: GetAttendancesRequest) => {
    try {
      setListLoading(true);
      setListError(null);

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
      if (axios.isAxiosError(err)) setListError(err.response?.data.message);
      else setListError("Failed to fetch attendances");
      throw err;
    } finally {
      setListLoading(false);
    }
  };

  const createAttendance = async (attendanceType: "CLOCK_IN" | "CLOCK_OUT") => {
    try {
      setSubmitLoading(true);
      setSubmitError(null);

      const response = await api.post<{ message: string }>(`/attendances?attendanceType=${attendanceType}`);

      return response.data.message;
    } catch (err) {
      if (axios.isAxiosError(err)) setSubmitError(err.response?.data.message);
      else setSubmitError("Failed to create attendance");
      throw err;
    } finally {
      setSubmitLoading(false);
    }
  };

  const checkIsNull = async () => {
    try {
      setListLoading(true);
      setListError(null);

      const response = await api.get<{ data: { count: number } }>(`/attendances/check?tzo=${tzo}`);

      return response.data.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setListError(err.response?.data.message);
      else setListError("Failed to create attendance");
      throw err;
    } finally {
      setListLoading(false);
    }
  };

  const getEmployeeStatus = async () => {
    try {
      setSubmitLoading(true);
      setSubmitError(null);

      const response = await api.get<{ data: GetEmployeeStatusResponse }>(`/attendances/check?tzo=${tzo}`);

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setSubmitError(err.response?.data.message);
      else setSubmitError("Failed to create attendance");
      throw err;
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    listLoading,
    submitLoading,
    listError,
    submitError,
    getAttendances,
    createAttendance,
    checkIsNull,
    getEmployeeStatus,
  };
};
