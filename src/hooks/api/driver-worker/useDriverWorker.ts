import axios from "axios";
import { useState } from "react";
import { GetJobByIdResponse, GetJobsRequest, GetJobsResponse, UpdateLaundryJobInputBody } from "@/types/driverWorker";

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

export const useDriverWorker = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tzo = new Date().getTimezoneOffset().toString();

  const getJobs = async (params: GetJobsRequest) => {
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
      if (params.transportType) queryParams.append("transportType", params.transportType);

      queryParams.append("tzo", tzo);
      queryParams.append("requestType", params.requestType);

      const response = await api.get<GetJobsResponse>(`/${params.endPoint}?${queryParams}`);

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to fetch jobs");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (endPoint: "transport-jobs" | "laundry-jobs", jobId: number) => {
    try {
      setLoading(true);

      const response = await api.get<GetJobByIdResponse>(`/${endPoint}/${jobId}`);

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to fetch job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOngoingJob = async (endPoint: "transport-jobs" | "laundry-jobs") => {
    try {
      setLoading(true);

      const response = await api.get<GetJobByIdResponse>(`/${endPoint}/ongoing`);

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to fetch job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkIsNull = async (endPoint: "transport-jobs" | "laundry-jobs", requestType: "request" | "history") => {
    try {
      setLoading(true);

      const response = await api.get<{ data: number }>(`/${endPoint}/check?requestType=${requestType}`);

      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to fetch job");
      throw err;
    }
  };

  const updateJob = async (endPoint: "transport-jobs" | "laundry-jobs", jobId: number, inputBody?: UpdateLaundryJobInputBody) => {
    try {
      setLoading(true);

      const response = await api.patch<{ message: string }>(`/${endPoint}/${jobId}?tzo=${tzo}`, inputBody);

      return response.data.message;
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data.message);
      else setError("Failed to update job");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getJobs,
    getJobById,
    getOngoingJob,
    checkIsNull,
    updateJob,
  };
};
