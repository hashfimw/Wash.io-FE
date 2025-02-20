import { useState } from "react";
import axios from "axios";
import { UserResponse, UserSearchParams } from "@/types/user";

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

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = async (params: UserSearchParams = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);

      const response = await api.get<UserResponse>(
        `/users?${queryParams.toString()}`
      );

      return response.data;
    } catch (err) {
      setError("Failed to fetch users");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getUsers,
  };
};
