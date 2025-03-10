import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { UserResponse, UserSearchParams } from "@/types/user";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
  users: new Map(),
  timestamp: new Map(),
  cacheDuration: 10000,
};

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestRef = useRef<string | null>(null);

  const getUsers = useCallback(async (params: UserSearchParams = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);

      const url = `/users?${queryParams.toString()}`;
      const cacheKey = url;
      setLoading(true);

      const now = Date.now();
      if (
        cache.users.has(cacheKey) &&
        cache.timestamp.has(cacheKey) &&
        now - cache.timestamp.get(cacheKey)! < cache.cacheDuration
      ) {
        const cachedData = cache.users.get(cacheKey);
        setLoading(false);
        return cachedData;
      }

      if (lastRequestRef.current === cacheKey) {
        setLoading(false);
        if (cache.users.has(cacheKey)) {
          return cache.users.get(cacheKey);
        }
      }

      lastRequestRef.current = cacheKey;

      const response = await api.get<UserResponse>(url);

      cache.users.set(cacheKey, response.data);
      cache.timestamp.set(cacheKey, now);

      setLoading(false);
      return response.data;
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
      setLoading(false);
      throw err;
    }
  }, []);

  const clearCache = useCallback(() => {
    cache.users.clear();
    cache.timestamp.clear();
    console.log("User cache cleared");
  }, []);

  return {
    loading,
    error,
    getUsers,
    clearCache,
  };
};
